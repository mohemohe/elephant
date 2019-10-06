package v1

import (
	"github.com/labstack/echo/v4"
	"github.com/mohemohe/elephant/server/models"
	"github.com/mohemohe/elephant/server/util"
	"net/http"
	"strings"
)

type (
	PostRequestsRequest struct {
		GoogleID string `json:"google_id"`
	}
)

func GetRequests(c echo.Context) error {
	limit := util.ToInt(c.QueryParam("limit"))
	page := util.ToInt(c.QueryParam("page"))
	q := strings.Split(c.QueryParam("q"), ",")
	result := models.FindRequest(limit, page, q)
	return c.JSON(http.StatusOK, result)
}

func PostRequests(c echo.Context) error {
	req := new(PostRequestsRequest)
	if err := c.Bind(req); err != nil {
		return c.NoContent(http.StatusNotAcceptable)
	}
	if err := models.CreateRequest(req.GoogleID); err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}