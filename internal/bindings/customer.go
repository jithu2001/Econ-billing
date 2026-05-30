// internal/bindings/customer.go
package bindings

import (
	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

type CustomerInput struct {
	FullName      string `json:"full_name"`
	Phone         string `json:"phone"`
	Address       string `json:"address"`
	IDProofType   string `json:"id_proof_type"`
	IDProofNumber string `json:"id_proof_number"`
}

type CustomerBinding struct {
	svc  *services.CustomerService
	sess *session.Session
}

func NewCustomerBinding(svc *services.CustomerService, sess *session.Session) *CustomerBinding {
	return &CustomerBinding{svc: svc, sess: sess}
}

func (b *CustomerBinding) GetAll() ([]models.Customer, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	return b.svc.GetAllCustomers(uid)
}

func (b *CustomerBinding) GetByID(id string) (*models.Customer, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	cid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return b.svc.GetCustomerByID(cid, uid)
}

func (b *CustomerBinding) Create(in CustomerInput) (*models.Customer, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	c := &models.Customer{
		ID: uuid.New(), UserID: uid,
		FullName: in.FullName, Phone: in.Phone, Address: in.Address,
		IDProofType: in.IDProofType, IDProofNumber: in.IDProofNumber,
	}
	if err := b.svc.CreateCustomer(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (b *CustomerBinding) Update(id string, in CustomerInput) (*models.Customer, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	cid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	c := &models.Customer{
		ID: cid, UserID: uid,
		FullName: in.FullName, Phone: in.Phone, Address: in.Address,
		IDProofType: in.IDProofType, IDProofNumber: in.IDProofNumber,
	}
	if err := b.svc.UpdateCustomer(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (b *CustomerBinding) Delete(id string) error {
	uid, err := b.sess.UserID()
	if err != nil {
		return err
	}
	cid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return b.svc.DeleteCustomer(cid, uid)
}
