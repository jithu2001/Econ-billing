// internal/bindings/settings.go
package bindings

import (
	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
)

type SettingsInput struct {
	LodgeName               string `json:"lodge_name"`
	Address                 string `json:"address"`
	Phone                   string `json:"phone"`
	GSTNumber               string `json:"gst_number"`
	StateName               string `json:"state_name"`
	StateCode               string `json:"state_code"`
	GSTInvoicePrefix        string `json:"gst_invoice_prefix"`
	GSTInvoiceNextNumber    int    `json:"gst_invoice_next_number"`
	NonGSTInvoicePrefix     string `json:"non_gst_invoice_prefix"`
	NonGSTInvoiceNextNumber int    `json:"non_gst_invoice_next_number"`
}

type SettingsBinding struct {
	svc  *services.SettingsService
	sess *session.Session
}

func NewSettingsBinding(svc *services.SettingsService, sess *session.Session) *SettingsBinding {
	return &SettingsBinding{svc: svc, sess: sess}
}

func (b *SettingsBinding) Get() (*models.Settings, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	return b.svc.Get(uid)
}

func (b *SettingsBinding) Save(in SettingsInput) (*models.Settings, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	s := &models.Settings{
		UserID:    uid,
		LodgeName: in.LodgeName, Address: in.Address, Phone: in.Phone,
		GSTNumber: in.GSTNumber, StateName: in.StateName, StateCode: in.StateCode,
		GSTInvoicePrefix: in.GSTInvoicePrefix, GSTInvoiceNextNumber: in.GSTInvoiceNextNumber,
		NonGSTInvoicePrefix: in.NonGSTInvoicePrefix, NonGSTInvoiceNextNumber: in.NonGSTInvoiceNextNumber,
	}
	if err := b.svc.Save(s, uid); err != nil {
		return nil, err
	}
	return s, nil
}
