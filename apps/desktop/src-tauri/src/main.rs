#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::{
  net::TcpListener,
  path::PathBuf,
  process::{Child, Command, Stdio},
  sync::{Arc, Mutex},
};
use tauri::{Manager, State};

#[derive(Default)]
struct BackendState {
  child: Option<Child>,
  base_url: Option<String>,
}

type SharedBackendState = Arc<Mutex<BackendState>>;

#[derive(thiserror::Error, Debug)]
enum BackendError {
  #[error("failed to start backend: {0}")]
  Start(String),
}

#[derive(Serialize)]
struct BackendInfo {
  base_url: String,
}

fn pick_free_port() -> Result<u16, BackendError> {
  let listener = TcpListener::bind(("127.0.0.1", 0))
    .map_err(|e| BackendError::Start(format!("bind: {e}")))?;
  let port = listener
    .local_addr()
    .map_err(|e| BackendError::Start(format!("local_addr: {e}")))?
    .port();
  Ok(port)
}

fn backend_workdir(app: &tauri::AppHandle) -> PathBuf {
  use tauri::path::BaseDirectory;

  // 优先：打包后的资源目录下的 backend/
  if let Ok(p) = app.path().resolve("backend", BaseDirectory::Resource) {
    if p.exists() {
      return p;
    }
  }

  // 开发模式：当前目录 ../backend
  std::env::current_dir()
    .unwrap_or_else(|_| PathBuf::from("."))
    .join("..")
    .join("backend")
}

fn start_backend(app: &tauri::AppHandle, state: &SharedBackendState) -> Result<BackendInfo, BackendError> {
  let port = pick_free_port()?;
  let base_url = format!("http://127.0.0.1:{port}");

  let workdir = backend_workdir(app);
  // Prefer a prebuilt backend binary (sidecar) later; for now run uvicorn via python.
  // This keeps development simple and matches the “bundled” architecture when you add a packaged python runtime.
  let python = std::env::var("PYTHON").unwrap_or_else(|_| "python".to_string());

  let mut cmd = Command::new(python);
  cmd.current_dir(&workdir)
    .env("HOST", "127.0.0.1")
    .env("PORT", port.to_string())
    .args([
      "-m",
      "uvicorn",
      "app.main:app",
      "--host",
      "127.0.0.1",
      "--port",
      &port.to_string(),
    ])
    .stdout(Stdio::null())
    .stderr(Stdio::null());

  let child = cmd
    .spawn()
    .map_err(|e| BackendError::Start(format!("spawn: {e}")))?;

  let mut s = state.lock().map_err(|e| BackendError::Start(format!("lock: {e}")))?;
  s.child = Some(child);
  s.base_url = Some(base_url.clone());

  Ok(BackendInfo { base_url })
}

#[tauri::command]
fn backend_info(state: State<SharedBackendState>) -> Option<BackendInfo> {
  let s = state.lock().ok()?;
  Some(BackendInfo {
    base_url: s.base_url.clone()?,
  })
}

#[tauri::command]
fn ensure_backend(app: tauri::AppHandle, state: State<SharedBackendState>) -> Result<BackendInfo, String> {
  {
    let s = state.lock().map_err(|e| e.to_string())?;
    if let Some(url) = &s.base_url {
      return Ok(BackendInfo { base_url: url.clone() });
    }
  }
  start_backend(&app, &state.inner()).map_err(|e| e.to_string())
}

fn main() {
  let backend_state: SharedBackendState = Arc::new(Mutex::new(BackendState::default()));

  let builder = tauri::Builder::default()
    .manage(backend_state.clone())
    .setup(|app| {
      // 应用启动时先启动后端
      let handle = app.handle();
      let state: tauri::State<SharedBackendState> = app.state();
      let _ = start_backend(&handle, &state.inner());
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![backend_info, ensure_backend]);

  builder
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(move |_app_handle, event| {
      use tauri::RunEvent;

      match event {
        RunEvent::ExitRequested { .. } | RunEvent::Exit { .. } => {
          if let Ok(mut s) = backend_state.lock() {
            if let Some(mut child) = s.child.take() {
              let _ = child.kill();
            }
          }
        }
        _ => {}
      }
    });
}

