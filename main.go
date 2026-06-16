// main.go
package main

import (
	"embed"
	"log"
	"os"

	"github.com/econ/econ/internal/database"
	"github.com/econ/econ/internal/session"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	path, err := database.ResolveDBPath()
	if err != nil { log.Fatalf("resolve db path: %v", err) }
	db, err := database.Open(path)
	if err != nil { log.Fatalf("open db: %v", err) }
	defer database.Close(db)

	app := NewApp(db)
	sess := session.New()

	regToken := os.Getenv("REGISTRATION_TOKEN")
	if regToken == "" {
		regToken = "919847073856"
	}

	err = wails.Run(&options.App{
		Title:            "Econ",
		Width:            1400,
		Height:           900,
		MinWidth:         1024,
		MinHeight:        768,
		Frameless:        true,
		DisableResize:    false,
		WindowStartState: options.Maximised,
		BackgroundColour: &options.RGBA{R: 249, G: 250, B: 251, A: 1},
		AssetServer:      &assetserver.Options{Assets: assets},
		OnStartup:        app.OnStartup,
		OnShutdown:       app.OnShutdown,
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
		},
		Bind: app.buildBindings(sess, regToken),
	})
	if err != nil { log.Fatalf("wails: %v", err) }
}
