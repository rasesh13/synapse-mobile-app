package com.synapseos.health

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class SpeechRecognitionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), RecognitionListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private val handler = Handler(Looper.getMainLooper())
    private var isListening = false

    override fun getName(): String = "SpeechRecognition"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun isAvailable(promise: Promise) {
        handler.post {
            try {
                val available = SpeechRecognizer.isRecognitionAvailable(reactContext)
                promise.resolve(available)
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }
    }

    @ReactMethod
    fun startListening(languageCode: String, promise: Promise) {
        handler.post {
            try {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer?.cancel()
                        speechRecognizer?.destroy()
                    } catch (_: Exception) {}
                    speechRecognizer = null
                }

                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)
                speechRecognizer?.setRecognitionListener(this)

                val bcp47Locale = when (languageCode.lowercase()) {
                    "hi" -> "hi-IN"
                    "bn" -> "bn-IN"
                    "ta" -> "ta-IN"
                    "te" -> "te-IN"
                    "mr" -> "mr-IN"
                    "gu" -> "gu-IN"
                    "kn" -> "kn-IN"
                    "ml" -> "ml-IN"
                    "pa" -> "pa-IN"
                    "or" -> "or-IN"
                    else -> "en-IN"
                }

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, bcp47Locale)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, bcp47Locale)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                    putExtra("android.speech.extra.DICTATION_MODE", true)
                }

                speechRecognizer?.startListening(intent)
                isListening = true
                promise.resolve(true)
            } catch (e: Exception) {
                isListening = false
                promise.reject("START_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        handler.post {
            try {
                speechRecognizer?.stopListening()
                isListening = false
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("STOP_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun cancel(promise: Promise) {
        handler.post {
            try {
                speechRecognizer?.cancel()
                speechRecognizer?.destroy()
                speechRecognizer = null
                isListening = false
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("CANCEL_ERROR", e.message)
            }
        }
    }

    // RecognitionListener Callbacks
    override fun onReadyForSpeech(params: Bundle?) {
        val map = Arguments.createMap().apply { putString("status", "ready") }
        sendEvent("onSpeechStart", map)
    }

    override fun onBeginningOfSpeech() {
        val map = Arguments.createMap().apply { putString("status", "recording") }
        sendEvent("onSpeechRecognizing", map)
    }

    override fun onRmsChanged(rmsdB: Float) {
        val map = Arguments.createMap().apply { putDouble("value", rmsdB.toDouble()) }
        sendEvent("onSpeechVolume", map)
    }

    override fun onBufferReceived(buffer: ByteArray?) {}

    override fun onEndOfSpeech() {
        isListening = false
        val map = Arguments.createMap().apply { putString("status", "end") }
        sendEvent("onSpeechEnd", map)
    }

    override fun onError(error: Int) {
        isListening = false
        val map = Arguments.createMap().apply {
            putInt("error", error)
            putString("message", getErrorMessage(error))
        }
        sendEvent("onSpeechError", map)
    }

    override fun onResults(results: Bundle?) {
        isListening = false
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val text = matches?.firstOrNull() ?: ""
        val map = Arguments.createMap().apply {
            putString("text", text)
            putBoolean("isFinal", true)
        }
        sendEvent("onSpeechResults", map)
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val text = matches?.firstOrNull() ?: ""
        if (text.isNotEmpty()) {
            val map = Arguments.createMap().apply {
                putString("text", text)
                putBoolean("isFinal", false)
            }
            sendEvent("onSpeechPartialResults", map)
        }
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}

    private fun getErrorMessage(errorCode: Int): String {
        return when (errorCode) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission not granted"
            SpeechRecognizer.ERROR_NETWORK -> "Network communication error"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech recognized"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognition service busy"
            SpeechRecognizer.ERROR_SERVER -> "Server error"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech detected"
            else -> "Speech error ($errorCode)"
        }
    }
}
