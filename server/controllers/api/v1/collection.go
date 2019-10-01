package v1

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

func GetCollections(c echo.Context) error {
	return c.JSON(http.StatusOK, struct {

	}{})
}