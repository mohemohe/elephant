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
	q := strings.Split(c.QueryParam("q"), ",")
	result := models.FindBookByGoogleIDs(limit, page, q)
	return c.JSON(http.StatusOK, result)
}
