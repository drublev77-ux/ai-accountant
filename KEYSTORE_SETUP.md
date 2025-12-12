# 🔐 Настройка Android Keystore для GitHub Actions

## Обзор

Этот документ содержит пошаговые инструкции для создания Android keystore, конвертации его в Base64, и настройки GitHub Secrets для автоматической сборки.

---

## 📋 Шаг 1: Создание Keystore

### Требования
- Java Development Kit (JDK) установлен на вашем компьютере
- Команда `keytool` доступна (входит в состав JDK)

### Команда для создания keystore

```bash
keytool -genkey -v -keystore release.keystore \
  -alias ai-accountant \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass aiaccountant2024 \
  -keypass aiaccountant2024 \
  -dname "CN=AI Accountant, OU=Development, O=AI Accountant Inc, L=San Francisco, S=California, C=US"
```

### Параметры:
- **alias**: `ai-accountant` - уникальный идентификатор ключа
- **storepass**: `aiaccountant2024` - пароль для keystore
- **keypass**: `aiaccountant2024` - пароль для ключа
- **validity**: `10000` дней (~27 лет)

### Результат
После выполнения команды в текущей директории появится файл `release.keystore`

---

## 📦 Шаг 2: Конвертация Keystore в Base64

### Linux/macOS:
```bash
cat release.keystore | base64 > release.keystore.base64
```

### Windows (PowerShell):
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore")) | Out-File release.keystore.base64
```

### Windows (Git Bash):
```bash
cat release.keystore | base64 > release.keystore.base64
```

### Просмотр содержимого:
```bash
cat release.keystore.base64
```

**Важно**: Скопируйте ВСЁ содержимое файла `release.keystore.base64` (это будет длинная строка)

---

## 🔑 Шаг 3: Создание GitHub Репозитория

### 3.1 Создать репозиторий на GitHub
1. Перейдите на https://github.com/new
2. Введите название репозитория (например: `ai-accountant`)
3. Выберите видимость: Public или Private
4. **НЕ добавляйте** README, .gitignore или LICENSE (они уже есть в проекте)
5. Нажмите **"Create repository"**

---

## 🔒 Шаг 4: Настройка GitHub Secrets

### 4.1 Перейдите в Settings репозитория
1. Откройте созданный репозиторий на GitHub
2. Перейдите в **Settings** (вкладка вверху)
3. В боковом меню выберите **Secrets and variables** → **Actions**
4. Нажмите **"New repository secret"**

### 4.2 Добавьте следующие секреты:

#### Секрет 1: ANDROID_KEYSTORE_BASE64
- **Name**: `ANDROID_KEYSTORE_BASE64`
- **Value**: Вставьте содержимое файла `release.keystore.base64`
- Нажмите **"Add secret"**

#### Секрет 2: ANDROID_KEYSTORE_PASSWORD
- **Name**: `ANDROID_KEYSTORE_PASSWORD`
- **Value**: `aiaccountant2024`
- Нажмите **"Add secret"**

#### Секрет 3: ANDROID_KEY_PASSWORD
- **Name**: `ANDROID_KEY_PASSWORD`
- **Value**: `aiaccountant2024`
- Нажмите **"Add secret"**

#### Секрет 4: ANDROID_KEY_ALIAS
- **Name**: `ANDROID_KEY_ALIAS`
- **Value**: `ai-accountant`
- Нажмите **"Add secret"**

### 4.3 Проверка
После добавления всех секретов вы должны увидеть 4 секрета:
- ✅ ANDROID_KEYSTORE_BASE64
- ✅ ANDROID_KEYSTORE_PASSWORD
- ✅ ANDROID_KEY_PASSWORD
- ✅ ANDROID_KEY_ALIAS

---

## 🚀 Шаг 5: Загрузка Кода на GitHub

### 5.1 Добавить remote origin
```bash
git remote add origin https://github.com/ВАШ-ПОЛЬЗОВАТЕЛЬ/ai-accountant.git
```

**Замените** `ВАШ-ПОЛЬЗОВАТЕЛЬ` на ваше имя пользователя GitHub!

### 5.2 Push кода
```bash
git push -u origin main
```

### 5.3 Что произойдет?
После push'а автоматически запустится GitHub Actions workflow:
1. Установка зависимостей
2. Сборка web приложения
3. Синхронизация с Capacitor
4. Сборка Android AAB (Release)
5. Загрузка артефакта

---

## 📥 Шаг 6: Скачивание AAB файла

### 6.1 Проверить статус сборки
1. Перейдите на GitHub в раздел **Actions**
2. Найдите workflow run "Build Android AAB"
3. Дождитесь завершения (✅ зелёная галочка, ~5-10 минут)

### 6.2 Скачать AAB
1. Откройте успешный workflow run
2. Пролистайте вниз до раздела **Artifacts**
3. Скачайте `android-release-aab`
4. Распакуйте ZIP архив
5. Внутри будет файл `app-release.aab`

---

## 🎯 Быстрая Справка

### Создали keystore?
```bash
ls -lh release.keystore
```

### Конвертировали в Base64?
```bash
wc -l release.keystore.base64  # должно быть ~50+ строк
```

### Добавили 4 секрета на GitHub?
- Settings → Secrets and variables → Actions

### Загрузили код?
```bash
git push -u origin main
```

### Сборка запустилась?
- GitHub → Actions → смотрим статус

---

## 🔧 Troubleshooting

### Проблема: keytool не найден
**Решение**: Установите JDK (Java Development Kit)
- macOS: `brew install openjdk`
- Ubuntu: `sudo apt install default-jdk`
- Windows: Скачайте с https://adoptium.net/

### Проблема: Push отклонён
**Решение**: Проверьте права доступа
```bash
git remote -v  # проверить URL
git push origin main --force  # если нужно
```

### Проблема: Сборка не запустилась
**Решение**: Проверьте наличие файла `.github/workflows/android-build.yml`

### Проблема: Сборка провалилась
**Решение**: Проверьте логи в GitHub Actions → выберите failed job → читайте ошибки

---

## ⚠️ Безопасность

### Важные правила:
1. **НИКОГДА** не коммитьте `release.keystore` в git
2. **НИКОГДА** не делитесь содержимым Base64 keystore
3. **Храните** пароли в надёжном месте (менеджер паролей)
4. **Используйте** GitHub Secrets для хранения конфиденциальных данных
5. **Сделайте backup** `release.keystore` в надёжном месте

### Файл .gitignore уже содержит:
```
*.keystore
*.keystore.base64
```

---

## 📚 Дополнительные Ресурсы

- [Android Documentation - Sign Your App](https://developer.android.com/studio/publish/app-signing)
- [GitHub Actions - Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)

---

## ✅ Checklist

- [ ] Java/JDK установлен
- [ ] Keystore создан (`release.keystore`)
- [ ] Keystore конвертирован в Base64
- [ ] GitHub репозиторий создан
- [ ] 4 секрета добавлены на GitHub
- [ ] Код загружен через `git push`
- [ ] GitHub Actions запустился
- [ ] AAB файл скачан
- [ ] Backup keystore сохранён в надёжном месте

---

**🎉 Готово! Теперь каждый push в main будет автоматически собирать Android AAB!**
