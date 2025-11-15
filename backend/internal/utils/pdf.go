package utils

import (
	"fmt"
	"os"
	"path/filepath"
)

func GenerateInvoicePDF(data interface{}, outputPath string) error {
	if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
		return err
	}

	file, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer file.Close()

	content := fmt.Sprintf("Invoice PDF\n\n%+v\n", data)
	if _, err := file.WriteString(content); err != nil {
		return err
	}

	return nil
}

func GenerateBillPDF(bill interface{}, customer interface{}, outputPath string) error {
	if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
		return err
	}

	file, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer file.Close()

	content := fmt.Sprintf("Bill PDF\n\nBill: %+v\n\nCustomer: %+v\n", bill, customer)
	if _, err := file.WriteString(content); err != nil {
		return err
	}

	return nil
}
