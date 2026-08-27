package me.grok.dealdex.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * On-device storage.
 *
 * Split deliberately in two:
 *
 *  - [secure] holds the session token, the PKCE verifier and the three paid desk
 *    API keys. These are credentials. They used to sit in a plain
 *    `MODE_PRIVATE` SharedPreferences file inside a manifest that set
 *    `android:allowBackup="true"`, so Android auto-backup was eligible to copy
 *    every one of them off the device.
 *  - [plain] holds the rest (origin, signed-in email), which is not secret and
 *    is cheaper to read.
 *
 * `allowBackup` is now false, and this uses `EncryptedSharedPreferences` so the
 * file is useless without the hardware-backed master key.
 */
class Prefs(ctx: Context) {
    private val plain: SharedPreferences = ctx.getSharedPreferences("dealdex", Context.MODE_PRIVATE)

    private val secure: SharedPreferences = runCatching {
        val masterKey = MasterKey.Builder(ctx)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            ctx,
            "dealdex.secure",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }.getOrElse {
        // A device with a broken keystore must still be usable. Falling back to
        // the plain file is worse than encrypted, but it is the same as the
        // behaviour this replaced — not a regression.
        ctx.getSharedPreferences("dealdex.secure.fallback", Context.MODE_PRIVATE)
    }

    init {
        migrateLegacy(ctx)
    }

    /**
     * One-time move: the old `spreaddex` file, then any credentials still
     * sitting in the plain `dealdex` file, into [secure].
     */
    private fun migrateLegacy(ctx: Context) {
        if (!plain.contains("migrated")) {
            val old = ctx.getSharedPreferences("spreaddex", Context.MODE_PRIVATE)
            val e = plain.edit()
            for ((k, v) in old.all) {
                if (!plain.contains(k) && v is String) e.putString(k, v)
            }
            e.putBoolean("migrated", true).apply()
        }
        if (plain.getBoolean("securedV1", false)) return
        val secureEdit = secure.edit()
        val plainEdit = plain.edit()
        for (key in SECRET_KEYS) {
            val legacy = plain.getString(key, "").orEmpty()
            if (legacy.isNotBlank() && secure.getString(key, "").isNullOrBlank()) {
                secureEdit.putString(key, legacy)
            }
            plainEdit.remove(key)
        }
        secureEdit.apply()
        plainEdit.putBoolean("securedV1", true).apply()
    }

    private fun secret(key: String) = secure.getString(key, "").orEmpty()
    private fun setSecret(key: String, v: String) = secure.edit().putString(key, v).apply()

    var justTcg: String
        get() = secret("justtcg")
        set(v) = setSecret("justtcg", v)
    var priceCharting: String
        get() = secret("pricecharting")
        set(v) = setSecret("pricecharting", v)
    var pokemonTcg: String
        get() = secret("pokemontcg")
        set(v) = setSecret("pokemontcg", v)
    var token: String
        get() = secret("token")
        set(v) = setSecret("token", v)

    /** PKCE verifier for an in-flight sign-in. Cleared once redeemed. */
    var authVerifier: String
        get() = secret("auth_verifier")
        set(v) = setSecret("auth_verifier", v)

    var origin: String
        get() = plain.getString("origin", "") ?: ""
        set(v) {
            plain.edit().putString("origin", v.trim().trimEnd('/')).apply()
        }

    /** Not a secret — shown in the account screen. */
    var email: String
        get() = plain.getString("email", "") ?: ""
        set(v) {
            plain.edit().putString("email", v).apply()
        }

    fun signedIn() = token.isNotBlank()

    private companion object {
        val SECRET_KEYS = listOf("justtcg", "pricecharting", "pokemontcg", "token")
    }
}
