package me.grok.dealdex.data

import android.content.Context
import android.content.Intent
import android.net.Uri

object NativeAuth {
    const val DEFAULT_ORIGIN = "https://dealdex.net"

    fun normalized(origin: String): String {
        var s = origin.trim().trimEnd('/')
        if (s.isEmpty()) return DEFAULT_ORIGIN
        if (!s.contains("://")) s = "https://$s"
        return s
    }

    fun start(context: Context, origin: String, provider: String) {
        val site = normalized(origin)
        val uri = Uri.parse("$site/api/native/oauth?provider=$provider")
        context.startActivity(Intent(Intent.ACTION_VIEW, uri))
    }

    fun parse(uri: Uri): AccountApi.Session {
        val err = uri.getQueryParameter("error")
        if (!err.isNullOrBlank()) {
            throw RuntimeException(err.replace("_", " "))
        }
        val token = uri.getQueryParameter("token")
        if (token.isNullOrBlank()) throw RuntimeException("No session token from the website.")
        return AccountApi.Session(token, uri.getQueryParameter("email").orEmpty())
    }
}
