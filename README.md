# Toplantı Yönetim Sistemi (Meeting Management Application)

## Proje Hakkında

Bu uygulama, kurumlar için geliştirilmiş kapsamlı bir toplantı yönetim sistemidir. Kullanıcılar toplantıları oluşturabilir, görüntüleyebilir, güncelleyebilir, iptal edebilir veya silebilirler. Sistem, toplantılara katılımcılar ekleyebilme ve bu katılımcılara toplantı işlemleri hakkında otomatik e-posta bildirimlerini gönderme özelliklerine sahiptir.

## Özellikler

- Kullanıcı kayıt ve giriş sistemi (JWT Kimlik doğrulama)
- CRUD işlemleri ile toplantı yönetimi
- Toplantı iptal etme ve silme özellikleri
- Toplantı katılımcılarına e-posta bildirimleri
  - Toplantı oluşturulduğunda
  - Toplantı iptal edildiğinde
  - Toplantı tamamen silindiğinde
- Toplantı dökümanları ekleme ve görüntüleme
- Modern ve kullanıcı dostu arayüz

## Teknoloji Stack

### Backend
- Node.js
- Express.js
- TypeScript
- MySQL (Sequelize ORM)
- JWT Kimlik Doğrulama
- Nodemailer (E-posta bildirimleri için)
- Multer (Dosya yükleme için)
- Swagger (API dokümantasyonu)

### Frontend
- React.js
- TypeScript
- Ant Design
- React Router
- Context API (State yönetimi)
- Axios (HTTP istekleri)
- Formik & Yup (Form yönetimi ve validasyonu)

## Ekran Görüntüleri

### Toplantı Listesi
![Toplantı Listesi](./Ekran%20Goruntuleri/toplanti-listesi.png)

### E-posta Bildirimleri

#### Karşılama E-postası
![Merhaba E-postası](./Ekran%20Goruntuleri/merhaba-maili.png)

#### Toplantı Eklendi Bildirimi
![Toplantı Eklendi](./Ekran%20Goruntuleri/toplanti-eklendi-maili.png)

#### Toplantı Silindi Bildirimi
![Toplantı Silindi](./Ekran%20Goruntuleri/toplanti-silindi-maili.png)

## Kurulum

### Ön Koşullar
- Node.js (v14+)
- MySQL
- Git

### Backend Kurulumu

1. Projeyi klonlayın
```bash
git clone [repo_url]
cd meeting-app-nodejs-react-full-project/backend
```

2. Bağımlılıkları yükleyin
```bash
npm install
```

3. `.env` dosyasını oluşturun
```
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=meeting_app
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. Sunucuyu çalıştırın
```bash
npm run dev
```

### Frontend Kurulumu

1. Frontend klasörüne geçin
```bash
cd ../meeting-app-frontend
```

2. Bağımlılıkları yükleyin
```bash
npm install
```

3. `.env` dosyasını oluşturun
```
REACT_APP_API_URL=http://localhost:4000/api
```

4. Frontend'i çalıştırın
```bash
npm start
```

## API Dokümantasyonu

API dokümantasyonu Swagger ile sağlanmıştır. Backend çalıştırıldıktan sonra aşağıdaki URL'den erişilebilir:

```
http://localhost:4000/api-docs
```

Ayrıca, projenin kök dizininde bir Postman koleksiyonu da bulunmaktadır (`Meeting_App_API.postman_collection.json`).

## E-posta Bildirimleri Hakkında

Sistem, aşağıdaki durumlarda katılımcılara otomatik e-posta gönderir:

1. **Toplantı Oluşturma**: Toplantı oluşturulduğunda, belirtilen katılımcılara toplantı detayları ile birlikte bilgilendirme e-postası gönderilir.

2. **Toplantı İptal**: Bir toplantı iptal edildiğinde, tüm katılımcılara iptal bildirim e-postası gönderilir.

3. **Toplantı Silme**: Bir toplantı tamamen silinirse, tüm katılımcılara bilgilendirme e-postası gönderilir.

### E-posta Sistemi Nasıl Çalışır?

- Backend'de `nodemailer` kullanılarak SMTP üzerinden e-posta gönderimi yapılır.
- Toplantı formlarında "Katılımcılar" alanına virgülle ayrılmış e-posta adresleri girilir.
- Toplantı kayıt edildiğinde, bu e-posta adresleri Meeting modelinde saklanır.
- Toplantı işlemleri gerçekleştiğinde (ekleme, iptal, silme), `sendMailToParticipants` yardımcı fonksiyonu çağrılarak ilgili katılımcılara HTML formatlı e-postalar gönderilir.

### E-posta Ayarları

E-posta gönderimi için `.env` dosyasında aşağıdaki değişkenlerin tanımlanması gereklidir:

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

**Not**: Gmail kullanılıyorsa, "App Password" kullanmanız gerekebilir. Güvenlik ayarlarından iki faktörlü doğrulamayı açın ve uygulama şifresi oluşturun.

## Frontend Yapısı

Frontend React ve TypeScript ile geliştirilmiştir. Kullanıcı dostu arayüz ile toplantıları listeleme, görüntüleme, ekleme, düzenleme ve silme işlemlerini destekler. Ant Design bileşenleri kullanılarak modern bir tasarım elde edilmiştir.

### Temel Sayfalar

- **Giriş/Kayıt**: Kullanıcı kimlik doğrulama işlemleri
- **Toplantı Listesi**: Tüm toplantıların görüntülendiği ana sayfa
- **Toplantı Detay**: Tek bir toplantının detaylarını görüntüleme
- **Toplantı Ekleme/Düzenleme**: Toplantı bilgilerini girme formu
- **Profil**: Kullanıcı profil yönetimi

## Backend Yapısı

Backend Node.js, Express ve TypeScript ile geliştirilmiştir. API end noktaları, veritabanı işlemleri, kullanıcı kimlik doğrulama ve dosya yükleme işlemlerini destekler.

### Temel Bileşenler

- **Controllers**: İş mantığı ve HTTP yanıtları
- **Models**: Veritabanı şemaları ve ORM yapılandırması
- **Routes**: API endpoint tanımları
- **Middleware**: Kimlik doğrulama ve hata yönetimi
- **Utils**: Yardımcı fonksiyonlar (e-posta gönderimi vb.)
- **Config**: Veritabanı, e-posta ve Swagger yapılandırmaları

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
