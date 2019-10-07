package v1

import (
	"github.com/labstack/echo/v4"
	"github.com/mohemohe/elephant/server/models"
	"github.com/mohemohe/elephant/server/util"
	"net/http"
	"strings"
)

func GetBooks(c echo.Context) error {
	limit := util.ToInt(c.QueryParam("limit"))
	page := util.ToInt(c.QueryParam("page"))
	var q []string = nil
	if c.QueryParam("q") != "" {
		q = strings.Split(c.QueryParam("q"), ",")
	}
	result := models.FindBook(limit, page, q)
	return c.JSON(http.StatusOK, result)
}
