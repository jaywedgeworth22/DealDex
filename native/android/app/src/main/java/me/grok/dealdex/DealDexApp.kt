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
            options.profilesSampleRate = 0.1
            options.isAnrEnabled = true
            options.sessionReplay.sessionSampleRate = 0.1
            options.sessionReplay.onErrorSampleRate = 1.0
            options.sessionReplay.setMaskAllText(true)
            options.sessionReplay.setMaskAllImages(true)
        }
    }
}
