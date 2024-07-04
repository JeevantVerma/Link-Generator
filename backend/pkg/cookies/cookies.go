package cookies

import (
	"net/http"
	"time"
)

func SetTokenCookie(name, token string, expiration time.Time, w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    token,
		Expires:  expiration,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Secure:   false,
	}

	http.SetCookie(w, cookie)
}
