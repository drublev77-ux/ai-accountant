# GitHub Actions - Автоматическая сборка Android AAB

## 📋 Обзор

Этот проект настроен для автоматической сборки Android App Bundle (AAB) файлов с использованием GitHub Actions. Workflow включает полную настройку Android SDK и поддержку подписи приложений.

## 🚀 Быстрый старт

### 1. Создание Keystore

Для подписи релизных версий необходим keystore файл:

```bash
keytool -genkey -v -keystore release.keystore -alias ai-accountant -keyalg RSA -keysize 2048 -validity 10000
```

**Важно:** Сохраните следующую информацию:
- Пароль keystore
- Пароль ключа (key password)
- Alias ключа

### 2. Конвертация Keystore в Base64

```bash
base64 -i release.keystore -o release.keystore.base64
# Для macOS/Linux
cat release.keystore | base64 > release.keystore.base64

# Скопируйте содержимое файла
cat release.keystore.base64
```

### 3. Настройка GitHub Secrets

Перейдите в Settings → Secrets and variables → Actions и добавьте следующие секреты:

| Секрет | Описание | Пример |
|--------|----------|--------|
| `ANDROID_KEYSTORE_BASE64` | Base64 содержимое keystore файла | `MIIKpAIBAzCCCm4GCSq...` |
| `ANDROID_KEYSTORE_PASSWORD` | Пароль keystore | `myStorePassword123` |
| `ANDROID_KEY_PASSWORD` | Пароль ключа | `myKeyPassword123` |
| `ANDROID_KEY_ALIAS` | Alias ключа | `ai-accountant` |

## 📝 Использование Workflow

### Автоматическая сборка

Workflow запускается автоматически при:

- **Push в main/develop** - собирает релизную версию
- **Pull Request** - собирает debug версию

### Ручной запуск

1. Перейдите в **Actions** → **Build Android AAB**
2. Нажмите **Run workflow**
3. Выберите тип сборки:
   - **debug** - debug версия (без подписи)
   - **release** - релизная версия (с подписью)

## 🔧 Структура Workflow

### Основные этапы:

1. **Setup Environment**
   - Node.js 20
   - Java JDK 17
   - Android SDK (API 34, Build Tools 34.0.0)

2. **Build Web App**
   - Установка зависимостей: `npm ci`
   - Сборка веб-приложения: `npm run build`
   - Синхронизация с Capacitor: `npx cap sync android`

3. **Configure Signing** (только для release)
   - Декодирование keystore из Base64
   - Создание `key.properties` файла
   - Настройка Gradle для подписи

4. **Build AAB**
   - Debug: `./gradlew bundleDebug`
   - Release: `./gradlew bundleRelease`

5. **Upload Artifacts**
   - Debug AAB (сохраняется 14 дней)
   - Release AAB (сохраняется 30 дней)
   - Mapping файлы для ProGuard (сохраняется 90 дней)

## 📦 Скачивание собранных файлов

После успешной сборки:

1. Перейдите в **Actions** → выберите нужный workflow run
2. Прокрутите вниз до секции **Artifacts**
3. Скачайте:
   - `android-debug-aab` - для debug версии
   - `android-release-aab` - для release версии
   - `android-mapping` - mapping файлы (для отладки крашей)

## 🔍 Локальная сборка AAB

Для тестирования перед загрузкой в GitHub Actions:

### Debug версия:
```bash
# Сборка веб-приложения
npm run build

# Синхронизация с Android
npx cap sync android

# Сборка AAB
cd android
./gradlew bundleDebug

# Результат: android/app/build/outputs/bundle/debug/app-debug.aab
```

### Release версия (с подписью):
```bash
# 1. Создайте key.properties в корне android/
cat > android/key.properties << EOF
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=ai-accountant
storeFile=keystore/release.keystore
EOF

# 2. Скопируйте keystore
mkdir -p android/app/keystore
cp release.keystore android/app/keystore/

# 3. Соберите AAB
npm run build
npx cap sync android
cd android
./gradlew bundleRelease

# Результат: android/app/build/outputs/bundle/release/app-release.aab
```

## 🛡️ Безопасность

### ⚠️ Важные правила:

1. **НИКОГДА** не коммитьте в Git:
   - `*.keystore` файлы
   - `*.jks` файлы
   - `key.properties` файл
   - Пароли в plain text

2. **ВСЕГДА** используйте GitHub Secrets для:
   - Keystore файлов (в Base64)
   - Паролей
   - API ключей

3. **Храните backup** keystore файла в безопасном месте
   - Без keystore невозможно обновить приложение в Google Play
   - Рекомендуется хранить в encrypted облачном хранилище

## 📊 Проверка статуса сборки

### GitHub Actions Badge

Добавьте в README.md:

```markdown
![Android AAB Build](https://github.com/ВАШЕ_ИМЯ/РЕПОЗИТОРИЙ/actions/workflows/android-build.yml/badge.svg)
```

### Отладка проблем

Если сборка не удалась:

1. **Проверьте логи** в GitHub Actions
2. **Частые проблемы:**
   - Отсутствуют секреты → добавьте в Settings
   - Неверный формат Base64 → пересоздайте
   - Неверные пароли → проверьте секреты
   - Ошибки Gradle → проверьте `android/build.gradle`

3. **Локальное тестирование:**
   ```bash
   # Проверка Gradle
   cd android
   ./gradlew clean
   ./gradlew bundleDebug --stacktrace
   ```

## 🚀 Публикация в Google Play

### Подготовка AAB файла:

1. Скачайте `android-release-aab` из GitHub Actions
2. Распакуйте архив, получите `app-release.aab`

### Загрузка в Google Play Console:

1. Перейдите в [Google Play Console](https://play.google.com/console)
2. Выберите ваше приложение
3. **Production** → **Create new release**
4. Загрузите `app-release.aab`
5. Заполните Release notes
6. **Review release** → **Start rollout**

### Первая публикация:

Для нового приложения также потребуется:
- Иконка приложения
- Скриншоты (минимум 2)
- Описание приложения
- Privacy Policy URL
- Content rating заполнение

## 🔄 CI/CD Pipeline

### Полный цикл разработки:

```
Code → Push → GitHub Actions → Build AAB → Artifacts → Google Play
```

### Рекомендуемый workflow:

1. **Разработка** - работа в feature ветках
2. **Pull Request** - автоматическая debug сборка для проверки
3. **Merge в develop** - сборка для internal testing
4. **Merge в main** - релизная сборка для production

## 📚 Дополнительные ресурсы

- [Android App Bundle документация](https://developer.android.com/guide/app-bundle)
- [GitHub Actions для Android](https://docs.github.com/en/actions)
- [Capacitor Android](https://capacitorjs.com/docs/android)
- [Google Play Console](https://support.google.com/googleplay/android-developer)

## 💡 Полезные команды

```bash
# Проверка версии приложения
grep versionName android/app/build.gradle

# Размер AAB файла
du -h android/app/build/outputs/bundle/release/app-release.aab

# Список файлов в AAB
unzip -l app-release.aab

# Проверка подписи
jarsigner -verify -verbose -certs app-release.aab

# Очистка build кеша
cd android && ./gradlew clean && cd ..
```

## 🎯 Следующие шаги

- [ ] Настроить автоматическое обновление версии
- [ ] Добавить автоматическое создание release notes
- [ ] Настроить автоматическую загрузку в Google Play (с помощью Fastlane)
- [ ] Добавить тесты перед сборкой
- [ ] Настроить notifications для успешных/неудачных сборок
