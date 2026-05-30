// app.go
package main

import (
	"context"

	"github.com/econ/econ/internal/bindings"
	"github.com/econ/econ/internal/repository"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
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

// buildBindings returns the slice for options.App.Bind. Caller passes Session.
// Unexported so the Wails generator does not walk *session.Session / *gorm.DB
// into the generated TypeScript models.
func (a *App) buildBindings(sess *session.Session, registrationToken string) []interface{} {
	db := a.db
	userRepo := repository.NewUserRepository(db)
	custRepo := repository.NewCustomerRepository(db)
	roomRepo := repository.NewRoomRepository(db)
	resRepo := repository.NewReservationRepository(db)
	billRepo := repository.NewBillRepository(db)
	payRepo := repository.NewPaymentRepository(db)
	setRepo := repository.NewSettingsRepository(db)

	return []interface{}{
		a,
		bindings.NewAuthBinding(services.NewAuthService(userRepo, setRepo), sess, registrationToken),
		bindings.NewCustomerBinding(services.NewCustomerService(custRepo), sess),
		bindings.NewRoomBinding(services.NewRoomService(roomRepo), sess),
		bindings.NewReservationBinding(services.NewReservationService(resRepo, roomRepo), sess),
		bindings.NewBillBinding(services.NewBillService(billRepo, setRepo), sess),
		bindings.NewPaymentBinding(services.NewPaymentService(payRepo, billRepo), sess),
		bindings.NewSettingsBinding(services.NewSettingsService(setRepo), sess),
	}
}
