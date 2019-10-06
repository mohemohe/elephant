package v1

import (
	"github.com/labstack/echo/v4"
	"github.com/mohemohe/elephant/server/models"
	"github.com/mohemohe/elephant/server/util"
	"net/http"
	"strings"
)

type (
	PostCollectionsRequest struct {
		GoogleID string `json:"google_id"`
	}
)

func GetCollections(c echo.Context) error {
	limit := util.ToInt(c.QueryParam("limit"))
	page := util.ToInt(c.QueryParam("page"))
	q := strings.Split(c.QueryParam("q"), ",")
	result := models.FindCollection(limit, page, q)
	return c.JSON(http.StatusOK, result)
}

func PostCollections(c echo.Context) error {
	req := new(PostCollectionsRequest)
	if err := c.Bind(req); err != nil {
		util.Logger().WithField("error", err).Error("create collection error")
		return c.NoContent(http.StatusNotAcceptable)
	}
	if err := models.CreateCollection(req.GoogleID); err != nil {
		util.Logger().WithField("error", err).Error("create collection error")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}