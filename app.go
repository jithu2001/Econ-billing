// app.go
package main

import (
	"context"

	rt "github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

type App struct {
	ctx context.Context
	db  *gorm.DB
}

func NewApp(db *gorm.DB) *App { return &App{db: db} }

func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) OnShutdown(ctx context.Context) {
	// DB close is handled in main() via defer
}

func (a *App) DB() *gorm.DB { return a.db }

// Window controls exposed to JS:
func (a *App) MinimizeWindow()  { rt.WindowMinimise(a.ctx) }
func (a *App) MaximizeWindow()  { rt.WindowToggleMaximise(a.ctx) }
func (a *App) CloseWindow()     { rt.Quit(a.ctx) }

// ShowSaveDialog returns the selected file path (empty if cancelled).
func (a *App) ShowSaveDialog(defaultName string) (string, error) {
	return rt.SaveFileDialog(a.ctx, rt.SaveDialogOptions{
		DefaultFilename: defaultName,
	})
}
