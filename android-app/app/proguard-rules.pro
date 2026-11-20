# Proguard rules for BN-ENG Assistant
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.bneng.assistant.ai.AiModels** { *; }
