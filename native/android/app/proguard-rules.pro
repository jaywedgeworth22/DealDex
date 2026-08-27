# R8 keep rules for the release build.
#
# OkHttp, Tink (EncryptedSharedPreferences) and Compose all ship consumer rules
# in their AARs, so this file only covers what is ours.

# Models are read reflectively out of org.json in Market.kt / AccountApi.kt.
-keep class me.grok.dealdex.data.** { *; }

# org.json is part of the platform; nothing to keep. Keep line numbers so a
# Play Console stack trace is still readable after obfuscation.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
