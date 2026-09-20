package com.synapseos.health

import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class TextToSpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false
    private val handler = Handler(Looper.getMainLooper())

    init {
        handler.post {
            try {
                tts = TextToSpeech(reactContext, this)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun getName(): String = "TextToSpeech"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true
            try {
                tts?.language = Locale("hi", "IN")
            } catch (_: Exception) {}

            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    val map = Arguments.createMap().apply { putString("id", utteranceId ?: "") }
                    sendEvent("onTtsStart", map)
                }

                override fun onDone(utteranceId: String?) {
                    val map = Arguments.createMap().apply { putString("id", utteranceId ?: "") }
                    sendEvent("onTtsDone", map)
                }

                @Deprecated("Deprecated in Java")
                override fun onError(utteranceId: String?) {
                    val map = Arguments.createMap().apply { putString("id", utteranceId ?: "") }
                    sendEvent("onTtsError", map)
                }
            })
        }
    }

    @ReactMethod
    fun speak(text: String, languageCode: String, promise: Promise) {
        handler.post {
            try {
                if (tts == null || !isInitialized) {
                    promise.reject("NOT_INITIALIZED", "TTS engine not ready")
                    return@post
                }

                val locale = when (languageCode.lowercase()) {
                    "hi" -> Locale("hi", "IN")
                    "bn" -> Locale("bn", "IN")
                    "ta" -> Locale("ta", "IN")
                    "te" -> Locale("te", "IN")
                    "mr" -> Locale("mr", "IN")
                    "gu" -> Locale("gu", "IN")
                    "kn" -> Locale("kn", "IN")
                    "ml" -> Locale("ml", "IN")
                    "pa" -> Locale("pa", "IN")
                    else -> Locale("en", "IN")
                }

                try {
                    tts?.language = locale
                } catch (_: Exception) {}

                val utteranceId = "synapse_tts_${System.currentTimeMillis()}"
                tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SPEAK_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        handler.post {
            try {
                tts?.stop()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("STOP_ERROR", e.message)
            }
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        handler.post {
            try {
                tts?.stop()
                tts?.shutdown()
            } catch (_: Exception) {}
        }
    }
}
