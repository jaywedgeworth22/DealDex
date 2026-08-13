package me.grok.spreaddex.ui

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import me.grok.spreaddex.R
import me.grok.spreaddex.data.AccountApi
import me.grok.spreaddex.data.AlertRule
import me.grok.spreaddex.data.DeskKeys
import me.grok.spreaddex.data.Market
import me.grok.spreaddex.data.Prefs
import me.grok.spreaddex.data.ScoredListing

data class DeskState(
    val query: String = "",
    val loading: Boolean = false,
    val rows: List<ScoredListing> = emptyList(),
    val error: String? = null,
    val view: String = "all",
    val rules: List<AlertRule> = listOf(AlertRule("default", "Steals under $100")),
    val justTcg: String = "",
    val priceCharting: String = "",
    val pokemonTcg: String = "",
    val settingsNote: String? = null,
    val origin: String = "",
    val loginEmail: String = "",
    val loginPassword: String = "",
    val accountEmail: String = "",
    val accountBusy: Boolean = false,
    val accountNote: String? = null,
)

class DeskViewModel(app: Application) : AndroidViewModel(app) {
    private val prefs = Prefs(app)
    private val _state = MutableStateFlow(DeskState())
    val state: StateFlow<DeskState> = _state

    init {
        val nm = app.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.createNotificationChannel(
            NotificationChannel("deals", "Deal alerts", NotificationManager.IMPORTANCE_DEFAULT),
        )
        _state.value = _state.value.copy(
            justTcg = prefs.justTcg,
            priceCharting = prefs.priceCharting,
            pokemonTcg = prefs.pokemonTcg,
            origin = prefs.origin,
            loginEmail = prefs.email,
            accountEmail = if (prefs.signedIn()) prefs.email else "",
        )
        scan("")
    }

    private fun keys() = DeskKeys(
        justTcg = _state.value.justTcg,
        priceCharting = _state.value.priceCharting,
        pokemonTcg = _state.value.pokemonTcg,
    )

    fun setQuery(q: String) { _state.value = _state.value.copy(query = q) }
    fun setView(v: String) { _state.value = _state.value.copy(view = v) }
    fun setJustTcg(v: String) { _state.value = _state.value.copy(justTcg = v, settingsNote = null) }
    fun setPriceCharting(v: String) { _state.value = _state.value.copy(priceCharting = v, settingsNote = null) }
    fun setPokemonTcg(v: String) { _state.value = _state.value.copy(pokemonTcg = v, settingsNote = null) }
    fun setOrigin(v: String) { _state.value = _state.value.copy(origin = v) }
    fun setLoginEmail(v: String) { _state.value = _state.value.copy(loginEmail = v) }
    fun setLoginPassword(v: String) { _state.value = _state.value.copy(loginPassword = v) }

    fun saveKeys() {
        prefs.justTcg = _state.value.justTcg
        prefs.priceCharting = _state.value.priceCharting
        prefs.pokemonTcg = _state.value.pokemonTcg
        _state.value = _state.value.copy(settingsNote = "Saved on this phone. Scan uses them even if DealDex.com is down.")
    }

    fun scan(q: String = _state.value.query) {
        _state.value = _state.value.copy(loading = true, error = null, query = q)
        val desk = keys()
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val rows = Market.scan(q, desk)
                _state.value = _state.value.copy(loading = false, rows = rows)
                fireAlerts(rows)
            } catch (e: Exception) {
                _state.value = _state.value.copy(loading = false, error = e.message ?: "Scan failed")
            }
        }
    }

    fun saveRule(rule: AlertRule) {
        val next = _state.value.rules.filterNot { it.id == rule.id } + rule
        _state.value = _state.value.copy(rules = next)
    }

    fun signIn(signup: Boolean) {
        val origin = _state.value.origin.trim().trimEnd('/')
        val email = _state.value.loginEmail.trim()
        val password = _state.value.loginPassword
        if (origin.isBlank() || email.isBlank() || password.length < 8) {
            _state.value = _state.value.copy(accountNote = "Website origin, email, and a password of 8+ characters.")
            return
        }
        _state.value = _state.value.copy(accountBusy = true, accountNote = null)
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val session = AccountApi.signIn(origin, email, password, signup)
                prefs.origin = origin
                prefs.token = session.token
                prefs.email = session.email
                _state.value = _state.value.copy(
                    accountBusy = false,
                    accountEmail = session.email,
                    origin = origin,
                    loginPassword = "",
                    accountNote = "Signed in. Keys still live on this phone. Pull or push to sync.",
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    accountBusy = false,
                    accountNote = e.message ?: "Could not reach the website. Scan still works with saved keys.",
                )
            }
        }
    }

    fun pullKeys() {
        val origin = prefs.origin
        val token = prefs.token
        if (origin.isBlank() || token.isBlank()) {
            _state.value = _state.value.copy(accountNote = "Sign in first.")
            return
        }
        _state.value = _state.value.copy(accountBusy = true, accountNote = null)
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val remote = AccountApi.pullKeys(origin, token)
                if (remote.justTcg.isNotBlank()) prefs.justTcg = remote.justTcg
                if (remote.priceCharting.isNotBlank()) prefs.priceCharting = remote.priceCharting
                if (remote.pokemonTcg.isNotBlank()) prefs.pokemonTcg = remote.pokemonTcg
                _state.value = _state.value.copy(
                    accountBusy = false,
                    justTcg = prefs.justTcg,
                    priceCharting = prefs.priceCharting,
                    pokemonTcg = prefs.pokemonTcg,
                    accountNote = "Pulled into this phone. Scan will use them even if the site goes down.",
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    accountBusy = false,
                    accountNote = (e.message ?: "Website unreachable") + " — using the keys already on this phone.",
                )
            }
        }
    }

    fun pushKeys() {
        val origin = prefs.origin
        val token = prefs.token
        if (origin.isBlank() || token.isBlank()) {
            _state.value = _state.value.copy(accountNote = "Sign in first.")
            return
        }
        prefs.justTcg = _state.value.justTcg
        prefs.priceCharting = _state.value.priceCharting
        prefs.pokemonTcg = _state.value.pokemonTcg
        _state.value = _state.value.copy(accountBusy = true, accountNote = null)
        viewModelScope.launch(Dispatchers.IO) {
            try {
                AccountApi.pushKeys(origin, token, keys())
                _state.value = _state.value.copy(accountBusy = false, accountNote = "Phone keys copied to your account.")
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    accountBusy = false,
                    accountNote = (e.message ?: "Website unreachable") + " — keys stay on this phone.",
                )
            }
        }
    }

    fun signOut() {
        prefs.token = ""
        _state.value = _state.value.copy(accountEmail = "", accountNote = "Signed out. Saved keys stay on this phone.")
    }

    private fun fireAlerts(rows: List<ScoredListing>) {
        val ctx = getApplication<Application>()
        var i = 1
        for (rule in _state.value.rules.filter { it.enabled }) {
            for (row in rows) {
                val a = row.appraisal ?: continue
                if (rule.verdicts.isNotEmpty() && a.verdict !in rule.verdicts) continue
                if (rule.maxPrice != null && (row.listing.price ?: Double.MAX_VALUE) > rule.maxPrice) continue
                if (rule.minSpread != null && (a.spread ?: -1.0) < rule.minSpread) continue
                if (rule.keyword.isNotBlank() && !row.listing.title.contains(rule.keyword, true)) continue
                val n = NotificationCompat.Builder(ctx, "deals")
                    .setSmallIcon(R.drawable.ic_delta)
                    .setContentTitle(rule.name)
                    .setContentText("${row.listing.title} · $${row.listing.price}")
                    .setAutoCancel(true)
                    .build()
                try {
                    NotificationManagerCompat.from(ctx).notify(i++, n)
                } catch (_: SecurityException) {
                }
            }
        }
    }

    fun visible(): List<ScoredListing> {
        val s = _state.value
        return s.rows.filter { row ->
            when (s.view) {
                "ebay" -> row.listing.marketplace == "ebay"
                "mercari" -> row.listing.marketplace == "mercari"
                "deals" -> row.appraisal?.verdict == "steal" || row.appraisal?.verdict == "good"
                else -> true
            }
        }
    }
}
