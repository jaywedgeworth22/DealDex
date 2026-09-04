package me.grok.dealdex

import android.app.Application
import io.sentry.android.core.SentryAndroid

/**
 * Early Sentry boot.  Card/desk data is not default PII for events —
 * screenshots and view hierarchy stay off.
 */
class DealDexApp : Application() {
    override fun onCreate() {
        super.onCreate()
        val dsn = BuildConfig.SENTRY_DSN
        if (dsn.isBlank()) return
        SentryAndroid.init(this) { options ->
            options.dsn = dsn
            options.isSendDefaultPii = false
            options.isAttachScreenshot = false
            options.isAttachViewHierarchy = false
            options.tracesSampleRate = 0.2
            options.isAnrEnabled = true
        }
    }
}
