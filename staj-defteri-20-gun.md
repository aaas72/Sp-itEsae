# SplitEase — Staj Defteri (Teknik Çalışmalar) — 20 İş Günü

Aşağıdaki metin, staj defteri “teknik çalışmalar” bölümüne uygun olacak şekilde hazırlanmıştır.
- Yazı tipi/puan: Times New Roman, 11 (Word’de ayarlanacaktır)
- Hizalama: İki yana yaslı (Word’de ayarlanacaktır)
- Her gün için en az 1 sayfa hedeflenmiştir; metinler özellikle uzun tutulmuştur.
- Her gün en az bir kanıtlayıcı öğe (Şekil/Çizelge/Ek) eklenmiştir.
- Resim/grafik yükseklik standardı: 6 cm (Word’de resim boyutundan ayarlanacaktır)

---

## İÇİNDEKİLER

| KONU | Sayfa No |
| :--- | ---: |
| Şekil, Çizelge ve Ekler Listesi | 1 |
| STAJ GÜNÜ 1 — Projeyi Tanıma, Gereksinim Analizi ve Ortam İncelemesi | 2 |
| STAJ GÜNÜ 2 — Postman ile Kimlik Doğrulama Uçlarını Test Etme | 3 |
| STAJ GÜNÜ 3 — Expo Ortamında Uygulamayı Çalıştırma ve Navigasyon Kontrolü | 4 |
| STAJ GÜNÜ 4 — Login Ekranı: Form Doğrulama, Yükleniyor Durumu ve Hata Yönetimi | 5 |
| STAJ GÜNÜ 5 — Register Ekranı: Kullanıcı Oluşturma Akışı ve Geri Bildirim | 6 |
| STAJ GÜNÜ 6 — Secure Store ile Token Saklama ve Oturum Sürekliliği | 7 |
| STAJ GÜNÜ 7 — Grupları Listeleme: Boş Durum, Yükleniyor ve Hata Senaryoları | 8 |
| STAJ GÜNÜ 8 — Grup Oluşturma: Form, Para Birimi ve Başarı Sonrası Güncelleme | 9 |
| STAJ GÜNÜ 9 — Davet Gönderme: E-posta Doğrulama ve Yetkilendirme | 10 |
| STAJ GÜNÜ 10 — Bekleyen Davetiyeler: Kabul/Ret, Liste Yenileme ve UI Durumları | 11 |
| STAJ GÜNÜ 11 — Grup Detayları ve Üye Listesi: Rol Gösterimi ve Güvenli Render | 12 |
| STAJ GÜNÜ 12 — Harcama (Expense) Oluşturma: Katılımcılar, Tutar ve Açıklama | 13 |
| STAJ GÜNÜ 13 — İşlemler Listesi ve Detay: Veri Sunumu ve Okunabilirlik | 14 |
| STAJ GÜNÜ 14 — Borçlar: Aktif/Ödendi Ayrımı, Borç/Alacak Mantığı | 15 |
| STAJ GÜNÜ 15 — Borç Kapatma (Settle): Mutasyon Sonrası Senkronizasyon | 16 |
| STAJ GÜNÜ 16 — Analitik/Özet: Toplamlar, Para Birimi ve Sunum | 17 |
| STAJ GÜNÜ 17 — Aktivite Kayıtları: Şeffaflık ve İzlenebilirlik | 18 |
| STAJ GÜNÜ 18 — Yetkisiz Erişim (401/403) ve Ortak Hata Yakalama Yaklaşımı | 19 |
| STAJ GÜNÜ 19 — Kullanılabilirlik: Loading/Retry, Ağ Hatası Senaryosu ve Stabilite | 20 |
| STAJ GÜNÜ 20 — Uçtan Uca Senaryo Testi, Bulgular ve Genel Değerlendirme | 21 |

---

## ŞEKİL, ÇİZELGE VE EKLER LİSTESİ

**Şekiller**
- Şekil 1. Proje klasör yapısı ve geliştirme ortamı (6 cm)
- Şekil 2. Postman ile /auth/register ve /auth/login testleri (6 cm)
- Şekil 3. Expo ile uygulamanın ilk çalıştırılması ve Metro çıktısı (6 cm)
- Şekil 4. Login ekranı doğrulama ve hata mesajı örneği (6 cm)
- Şekil 5. Register ekranı ve başarılı kayıt sonucu (6 cm)
- Şekil 6. Secure Store ile token saklama/okuma akışı (6 cm)
- Şekil 7. Grup listeleme ekranı ve boş durum mesajı (6 cm)
- Şekil 8. Grup oluşturma ekranı ve başarılı yanıt (6 cm)
- Şekil 9. Davet gönderme ekranı / form doğrulama (6 cm)
- Şekil 10. Bekleyen davetiyeler listesi ve kabul/ret işlemi (6 cm)
- Şekil 11. Grup detay ekranı ve üyeler/roller (6 cm)
- Şekil 12. Harcama (expense) ekleme ekranı (6 cm)
- Şekil 13. İşlemler listesi ve işlem detay görünümü (6 cm)
- Şekil 14. Borçlar ekranı (aktif/ödendi ayrımı) (6 cm)
- Şekil 15. Borç kapatma (settle) işlem sonucu ve güncellenen liste (6 cm)
- Şekil 16. Analitik özet ekranı / toplamlar (6 cm)
- Şekil 17. Aktivite kayıtları ekranı (6 cm)
- Şekil 18. 401/403 hata yönetimi ve kullanıcı uyarısı (6 cm)
- Şekil 19. Loading/Retry ve ağ hatası senaryosu (6 cm)
- Şekil 20. Uçtan uca senaryo testi çıktısı (6 cm)

**Çizelgeler**
- Çizelge 1. Kullanılan araçlar ve amaçları
- Çizelge 2. Test edilen temel API uçları ve beklenen sonuçlar
- Çizelge 3. Karşılaşılan sorunlar ve uygulanan çözümler
- Çizelge 4. Mobil–API veri alanı eşleştirme özeti
- Çizelge 5. Grup listesinde görüntülenen veri modeli ve UI karşılıkları

**Ekler**
- Ek 1. Örnek Postman istek/yanıt çıktıları (seçilmiş)
- Ek 2. Örnek mobil API istemcisi yapılandırması (kod)
- Ek 3. Örnek token saklama (Secure Store) kod parçası
- Ek 4. Örnek hata yakalama ve kullanıcıya gösterim yaklaşımı

---

## Sayfa No: ……

### STAJ GÜNÜ 1 — Projeyi Tanıma, Gereksinim Analizi ve Ortam İncelemesi

Stajın ilk gününde SplitEase uygulamasının genel problem alanını ve hedef kullanıcı kitlesini anlamaya odaklandım. Uygulama; kullanıcıların grup oluşturup harcamaları paylaştığı, borç/alacak durumlarını takip ettiği ve grup içi davet/üyelik süreçlerini yönettiği bir mobil sistemdir. Bu nedenle temel senaryoları (kayıt–giriş, grup yönetimi, davetiyeler, harcama oluşturma, borçların görünümü ve tasfiyesi) bir kontrol listesi halinde çıkararak günlere yayılacak çalışma planı hazırladım.

Teknik tarafta mobil uygulamanın React Native/Expo ile geliştirildiğini, backend tarafının Node.js üzerinde çalıştığını ve verilerin MongoDB’de tutulduğunu analiz ettim. Proje klasör yapısını inceleyerek ekranların, ortak bileşenlerin ve yardımcı fonksiyonların hangi dizinlerde konumlandığını not aldım. Ayrıca API’nin uç noktaları ve veri modelleri hakkında hızlı bir ön okuma yaparak mobil uygulamanın hangi isteklerle hangi verileri beklediğini çıkardım.

Bu aşamada kullandığım araçlar; VS Code ile kod okuma, Node.js ve npm ile paket yönetimi, MongoDB/Mongoose yapısını anlamaya yönelik şema incelemesi ve Postman ile API testine hazırlık oldu. Öğrenme açısından en önemli kazanımım, mobil taraftaki her ekranın aslında belirli bir API sözleşmesine (request/response şeması) bağlı olduğuydu. Bu sözleşme netleşmeden UI tarafında doğru geliştirme yapmak zorlaştığı için öncelikle veri akışını anlamanın değerini gördüm.

Karşılaşılan ilk sorun, ortam değişkenleri (ör. API adresi, Mongo bağlantısı) ve geliştirme ortamı yapılandırmasının ekipten ekibe değişebilmesiydi. Bunu çözmek için proje dokümantasyonunu kontrol edip, çalışma ortamını “çalıştırılabilir” hale getirecek adımları sıraladım ve not aldım. Ayrıca sonraki günlerde kullanılacak test verisi senaryolarını (örnek kullanıcılar, gruplar ve harcamalar) planladım.

Günün sonucunda projenin kapsamını netleştirdim ve günlük çalışma çıktılarının staj defterinde nasıl kanıtlanacağını belirledim: her gün için en az bir ekran görüntüsü (Şekil), gerekiyorsa tablo (Çizelge) ve kritik noktalarda kısa kod parçası (Ek) ekleme yaklaşımını benimsedim.

Şekil 1: Proje klasör yapısı ve geliştirme ortamı (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 2 — Postman ile Kimlik Doğrulama Uçlarını Test Etme

İkinci günün ana hedefi, mobil uygulamanın temelini oluşturan kimlik doğrulama uçlarını Postman üzerinden sistematik biçimde test etmekti. Öncelikle kullanıcı kayıt (register) ve giriş (login) işlemlerinin başarılı senaryolarında hangi alanların döndüğünü, token üretiminin nasıl yapıldığını ve sonraki isteklerde bu token’ın nasıl kullanılacağını kontrol ettim. Böylece mobilde oturum yönetimi yapılırken hangi verilerin saklanması gerektiği netleşti.

Postman üzerinde farklı test senaryoları oluşturdum: eksik alanlarla kayıt denemesi, hatalı e-posta formatı, mevcut e-posta ile yeniden kayıt, yanlış parola ile giriş, doğru parola ile giriş ve giriş sonrası korumalı uçlara erişim gibi adımları çalıştırdım. Bu senaryolar sayesinde backend’in hangi hata kodlarıyla ve hangi mesajlarla yanıt verdiğini not aldım. Mobil uygulamada kullanıcıya gösterilecek mesajların bu teknik mesajlardan türetilmesi gerektiği için hata metinlerini sınıflandırdım.

Bu çalışmada Postman koleksiyon mantığını ve environment değişkenlerini (ör. base URL, token değişkeni) kullanarak testleri daha tekrarlanabilir hale getirdim. Ayrıca istek başlıkları içinde Authorization: Bearer <token> kullanımını doğruladım. Öğrenme açısından, aynı endpoint’in farklı durumlarda farklı response şemaları döndürebileceğini ve mobil tarafta bu çeşitliliğe dayanıklı kod yazmak gerektiğini gördüm.

Karşılaşılan zorluklardan biri, bazı hataların kullanıcıya doğrudan teknik mesaj olarak dönmesiydi. Çözüm olarak mobilde bu mesajların kullanıcı dostu metinlere dönüştürülmesi gerektiğini ve ortak bir hata işleme katmanı tasarlanmasının faydalı olacağını belirledim. Ayrıca token’ın geçersiz/eksik olması durumunda dönen hataların, uygulamada otomatik logout veya yeniden giriş yönlendirmesi ile ele alınması gerektiğini not aldım.

Günün sonucunda, mobil geliştirme başlamadan önce API davranışlarını “kanıtlanabilir” şekilde kayıt altına aldım. Bu çıktıların staj defterinde kanıtı olarak Postman ekran görüntüsü (Şekil 2) ve örnek request/response ekleri hazırlanacaktır.

Şekil 2: Postman ile /auth/register ve /auth/login testleri (Yükseklik: 6 cm)

Ek 1: Örnek Postman istek/yanıt çıktıları (seçilmiş)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 3 — Expo Ortamında Uygulamayı Çalıştırma ve Navigasyon Kontrolü

Üçüncü gün, mobil uygulamayı Expo üzerinde çalıştırarak temel runtime davranışını gözlemledim. Uygulamanın açılış akışında hangi ekranın geldiği, oturum varsa ana sayfaya yönlendirme yapılıp yapılmadığı ve navigasyon yapısının (stack/tab) nasıl kurulduğu kontrol edildi. Bu kontrol, sonraki günlerde eklenecek hata yönetimi ve oturum sürekliliği mekanizmalarının hangi noktalara entegre edileceğini anlamamı sağladı.

Expo’nun geliştirme döngüsünü kullanarak (hot reload, log çıktıları, uyarılar) hızlı geri bildirim aldım. Uygulama başlatıldığında Metro bundler çıktılarında görülen uyarıları analiz ettim ve gerekli durumda bağımlılıkların sürüm uyumluluğunu kontrol etmeyi planladım. Ayrıca Android cihaz/emülatör üzerinde ağ erişimi konusunu test ederek API’ye istek atılabilmesi için base URL’nin doğru yapılandırılması gerektiğini teyit ettim.

Bu çalışmada React Native/Expo’nun çalıştırma mantığını, geliştirme sırasında debug etme pratiklerini ve log okuma alışkanlığını geliştirdim. Öğrenme olarak, “cihazdan backend’e bağlantı” konusunun Windows/Android/localhost kombinasyonunda sıkça sorun çıkarabileceğini ve bunun erken aşamada test edilmesinin kritik olduğunu gördüm.

Karşılaştığım sorun, bazı durumlarda cihazın localhost’a erişememesi olasılığıydı. Bu riski azaltmak için test planı oluşturdum: aynı isteği Postman ile çalıştırma, mobil uygulamada istek atma, gerekirse lokal IP üzerinden erişim veya emulator network ayarlarını kontrol etme. Böylece ileride “API çalışıyor ama mobil bağlanamıyor” türü sorunların hızlı teşhis edilebilmesini hedefledim.

Günün sonunda uygulama çalışma ortamı stabil hale geldi ve artık ekran bazlı geliştirme/test adımlarına geçilebilecek noktaya ulaşıldı. Kanıt olarak Expo çalıştırma çıktısı ve ilk ekran görüntüsü eklenecektir.

Şekil 3: Expo ile uygulamanın ilk çalıştırılması ve Metro çıktısı (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 4 — Login Ekranı: Form Doğrulama, Yükleniyor Durumu ve Hata Yönetimi

Dördüncü günün odak noktası giriş (login) ekranında kullanıcı deneyimini iyileştirmek oldu. Kullanıcı e-posta ve parola alanlarını doldururken basit doğrulama kuralları (boş geçilemez, e-posta formatı, minimum parola kuralları vb.) üzerinden formu kontrol ettim. Hatalı girişte kullanıcının ne yapması gerektiğini anlaması için mesajların net ve kısa olmasını hedefledim.

API tarafında login isteğinin başarılı olması durumunda dönen token’ların mobil tarafta hangi yapıda ele alındığını inceledim. Bu adım, sonraki günlerde Secure Store ile saklama ve uygulama açılışında token okuma planına hazırlık sağladı. Ayrıca login işlemi sırasında kullanıcıya “yükleniyor” göstergesi verilmesi ve işlem tamamlandığında ekran yönlendirmesinin tutarlı olması kontrol edildi.

Kullanılan teknikler arasında: async istek yönetimi, hata yakalama (network error ve API error ayrımı), kullanıcıya uyarı bileşeni ile bildirim gösterimi ve tekrarlanabilir test senaryoları yer aldı. Öğrenilen yeni bilgilerden biri, aynı hatanın hem backend’den dönen mesaj hem de ağ kaynaklı istisna şeklinde iki farklı yoldan gelebileceğiydi; bu nedenle tek bir hata yaklaşımıyla tüm durumları kapsamak önemlidir.

Karşılaşılan sorun olarak bazı hata mesajlarının teknik ve uzun olması görüldü. Çözüm olarak hata mesajlarının kullanıcı dostu kısa metinlere dönüştürülmesi ve detayların gerektiğinde loglarda tutulması yaklaşımını seçtim. Ayrıca tekrar deneme davranışı için kullanıcıya “yeniden dene” fırsatı verilmesi gerektiğini not aldım.

Sonuç olarak login ekranı, hem başarılı hem hatalı durumlarda kontrol edilebilir ve tutarlı hale getirildi. Kanıt olarak login doğrulama ve hata mesajı ekran görüntüsü eklenecektir.

Şekil 4: Login ekranı doğrulama ve hata mesajı örneği (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 5 — Register Ekranı: Kullanıcı Oluşturma Akışı ve Geri Bildirim

Beşinci gün kayıt (register) ekranında kullanıcı oluşturma akışını uçtan uca doğruladım. Kullanıcıdan alınan isim, e-posta ve parola bilgilerinin hem UI tarafında doğrulanması hem de API’nin beklediği payload formatında gönderilmesi sağlandı. Özellikle parola tekrar alanı (confirm) gibi alanlarda tutarlılık kontrolü yaparak yanlış girişleri daha başta engellemeyi hedefledim.

Kayıt isteği başarılı olduğunda kullanıcıya olumlu geri bildirim verilmesi ve sonrasında uygulamanın hangi ekrana yönleneceğinin tutarlı olması kontrol edildi. Kullanıcı deneyimi açısından kayıt işlemi bitince doğrudan girişe yönlendirme veya otomatik oturum açma senaryolarından hangisinin kullanıldığı netleştirildi. Bu süreçte form durum yönetimi (başarılı → alanları temizle, hata → alanları koru) yaklaşımını planladım.

Araç ve teknikler olarak: Postman ile örnek kayıt istekleri, mobilde form doğrulama, yükleniyor durumu, hata yakalama ve başarı bildirim bileşenleri kullanıldı. Öğrenme açısından, kayıt sırasında dönen hata mesajlarının (ör. e-posta zaten mevcut) mobilde doğru kullanıcı aksiyonuna dönüştürülmesi gerektiğini gördüm.

Karşılaşılan bir sorun, bazı doğrulama hatalarının kullanıcıya eksik veya geç yansımasıydı. Çözüm olarak doğrulamayı hem istemci tarafında hem de API yanıtında iki katmanlı ele almak gerektiğini not aldım. Böylece kullanıcı yanlış veri girdiğinde hızlıca uyarı alırken, API tarafında da güvenlik/kurallar korunmuş olur.

Günün sonunda kayıt ekranı kararlı hale getirildi ve oturum sürekliliği için token saklama aşamasına geçilecek temel hazırlandı. Kanıt olarak register ekranı ve başarılı kayıt sonucu görüntüsü eklenecektir.

Şekil 5: Register ekranı ve başarılı kayıt sonucu (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 6 — Secure Store ile Token Saklama ve Oturum Sürekliliği

Altıncı gün, mobil uygulamada oturum sürekliliğini sağlayan token saklama yaklaşımı üzerinde çalıştım. Kullanıcı giriş yaptığında alınan erişim token’ının güvenli şekilde saklanması ve uygulama tekrar açıldığında token’ın okunarak kullanıcıyı tekrar girişe zorlamadan ilerletme mantığı incelendi. Bu süreçte güvenli saklama gereksinimi nedeniyle expo-secure-store kullanımının avantajları değerlendirildi.

Token’ı saklama/okuma işlemlerinde iki önemli konu öne çıktı: birincisi, token değiştiğinde (ör. refresh token ile yenilenirse) storage ile uygulama state’inin senkron kalması; ikincisi ise logout işleminde token’ın hem state’ten hem storage’dan temizlenerek yetkisiz ekranlara erişimin engellenmesi. Bu kapsamda oturum yönetimi akışını adım adım test ederek olası tutarsızlıkları not aldım.

Kullanılan teknikler: güvenli saklama API’leri, async işlem yönetimi, uygulama açılışında oturum kontrolü ve korumalı ekran mantığı. Öğrenme olarak, token saklama işleminin sadece “kaydet/oku” değil, aynı zamanda “hata durumlarında geri dönüş planı” gerektirdiğini gördüm; örneğin storage okuma hatası olursa kullanıcı güvenli şekilde login’e yönlendirilmelidir.

Karşılaşılan sorun olarak token güncellenmesine rağmen eski token ile istek atılma ihtimali vardı. Bunu çözmek için token güncellemelerinde tek kaynak (single source of truth) yaklaşımıyla state ve storage sıralamasını netleştirme gereğini belirledim. Ayrıca yetkisiz hatalarda token’ın geçersiz olabileceği durumlara karşı otomatik temizlik ve kullanıcı bilgilendirmesi planladım.

Günün sonucunda token saklama yaklaşımını staj defterinde kanıtlayacak şekilde kod eki (Ek 3) ve akış şeması ekran görüntüsü (Şekil 6) hazırlanacak şekilde planladım.

Şekil 6: Secure Store ile token saklama/okuma akışı (Yükseklik: 6 cm)

Ek 3: Örnek token saklama (Secure Store) kod parçası

Örnek Kod (Ek 3):

```js
// Token saklama (örnek)
await SecureStore.setItemAsync('accessToken', accessToken);

// Token okuma (örnek)
const token = await SecureStore.getItemAsync('accessToken');
```

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 7 — Grupları Listeleme: Boş Durum, Yükleniyor ve Hata Senaryoları

Yedinci gün, kullanıcının üyesi olduğu grupları listeleyen ekranın davranışını test ettim ve iyileştirme noktalarını belirledim. Grup listesi ekranı, uygulamanın ana kullanım noktalarından biri olduğu için kullanıcı uygulamaya girdiğinde hızlı ve doğru bilgi görmelidir. Bu nedenle liste boş olduğunda “henüz grubunuz yok” gibi yönlendirici mesaj gösterimi, yükleniyor durumunda spinner gösterimi ve hata durumunda tekrar deneme aksiyonu gibi temel UX durumlarını ele aldım.

API’den gelen grup listesinin veri yapısını Postman üzerinden doğruladım ve mobil tarafta bu verinin doğru render edildiğini kontrol ettim. Liste elemanlarında grup adı, para birimi ve üye sayısı gibi alanların doğru gösterimi, alan eksik geldiğinde ekranın bozulmaması için güvenli kontrollerle güçlendirildi. Ayrıca uzun grup adlarının UI’da taşma yapmaması için metin yerleşimi gözden geçirildi.

Kullanılan teknikler: liste ekranlarında asenkron veri çekme, state yönetimi (loading/success/empty/error), yeniden deneme (retry) mantığı, kullanıcıya kısa geri bildirim gösterimi. Öğrenme açısından, “boş ekran” ve “hata ekranı” tasarımının kullanıcıyı kaybetmemek için en az normal senaryolar kadar önemli olduğunu gördüm.

Karşılaşılan problem olarak bazı gruplarda üye sayısı gibi alanlar her zaman dolu gelmeyebiliyordu. Çözüm olarak bu alanların opsiyonel olduğunu kabul ederek UI’da güvenli varsayılan değerler kullanılması planlandı. Böylece veri tutarsızlığı oluşsa bile kullanıcı ekranı kırılmadan görmeye devam eder.

Günün değerlendirmesinde grup listesi ekranı daha sağlam hale getirildi ve bir sonraki adım olarak “grup oluşturma” ekranına geçmek için gereksinimler netleştirildi.

Çizelge 5: Grup listesinde görüntülenen veri modeli ve UI karşılıkları

| Veri Alanı (JSON Key) | UI Bileşeni | Veri Tipi | İşlevi |
| :--- | :--- | :--- | :--- |
| _id | Gizli | String (UUID) | Detay sayfasına geçiş için anahtar. |
| name | Text (Bold) | String | Grubun başlığı. |
| currency | Icon/Text | String (ISO) | Para birimi simgesi (₺, $, €). |
| memberCount | Badge | Number | Gruptaki toplam kişi sayısı. |

Akış Şeması: Grup listesi veri modeli → UI eşleştirme akışı

```mermaid
flowchart TD
	A[/GET /groups API Yanıtı/] --> B[groups: Array]
	B --> C{Her grup nesnesi}

	C --> D[_id]
	D --> D1[State: selectedGroupId]
	D1 --> D2[onPress → Detay sayfasına git]

	C --> E[name]
	E --> E1[UI: Text (Bold)]

	C --> F[currency]
	F --> F1[UI: Icon/Text]
	F1 --> F2[Format: ISO → ₺ / $ / €]

	C --> G[memberCount]
	G --> G1[UI: Badge]
	G1 --> G2[Label: "Üye: N"]

	C --> H[Render: GroupCard/ListItem]
	H --> I[FlatList/ScrollView'da listele]
	I --> J{Boş liste mi?}
	J -- Evet --> K[Empty State: "Henüz grubunuz yok"]
	J -- Hayır --> L[Listeyi göster]

	B --> M{İstek hatası mı?}
	M -- Evet --> N[Error State + Retry]
	M -- Hayır --> O[Normal akış]
```

Şekil 7: Grup listeleme ekranı ve boş durum mesajı (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 8 — Grup Oluşturma: Form, Para Birimi ve Başarı Sonrası Güncelleme

Sekizinci gün, kullanıcıların yeni bir grup oluşturabileceği ekran üzerinde çalıştım. Grup adı, açıklama ve para birimi gibi alanların doğru şekilde kullanıcıdan alınması, form doğrulama kurallarıyla kontrol edilmesi ve API’ye gönderilmesi hedeflendi. Grup oluşturma başarılı olduğunda kullanıcıya bildirim verilip grup listesinin otomatik güncellenmesi, başarısız olduğunda ise hata mesajının net şekilde gösterilmesi amaçlandı.

Teknik olarak grup oluşturma isteğinin payload yapısı Postman üzerinden doğrulandı ve mobilde aynı isteğin doğru gönderildiği test edildi. Form gönderimi sırasında butonun devre dışı bırakılması, çift tıklamayı önleme ve network gecikmesinde kullanıcıyı bilgilendirme gibi detaylar ele alındı. Ayrıca para birimi alanında varsayılan değer ve kullanıcı seçimi senaryoları test edildi.

Kullanılan araç/teknikler: Postman testleri, React Native form state yönetimi, yükleniyor göstergesi, hata/başarı uyarıları, istek sonrası liste yenileme (refetch) yaklaşımı. Öğrenme açısından, “mutasyon” yapan işlemlerde (create/update/delete) başarıdan sonra UI verisinin mutlaka güncellenmesi gerektiğini ve bunun kullanıcı güveni için çok önemli olduğunu gördüm.

Karşılaşılan sorun olarak, grup oluşturma sonrası bazı durumlarda eski listenin kısa süre ekranda kalması gözlemlendi. Çözüm olarak başarılı yanıt alındığında liste verisinin yeniden çekilmesi veya lokal state’e yeni öğe eklenmesi gibi iki yaklaşım değerlendirilip en güvenilir olanı seçildi.

Günün sonunda grup oluşturma ekranı kararlı hale getirildi ve davet akışına geçmek için temel hazırlandı. Kanıt olarak grup oluşturma ekranı ve başarılı sonuç ekran görüntüsü eklenecektir.

Şekil 8: Grup oluşturma ekranı ve başarılı yanıt (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 9 — Davet Gönderme: E-posta Doğrulama ve Yetkilendirme

Dokuzuncu gün, grup içerisinde yeni üye davet etme akışını ele aldım. Davet sistemi, grup yöneticisinin bir kullanıcıyı e-posta üzerinden davet etmesi ve davetiyenin karşı tarafa “bekleyen davetiye” olarak düşmesi mantığıyla çalışır. Bu nedenle davet gönderme ekranında e-posta doğrulaması, isteğin doğru gruba gönderilmesi ve sonuç geri bildirimi kritik öneme sahiptir.

Postman üzerinden davet gönderme uçlarını test ederek hangi durumlarda başarı/hata döndüğünü doğruladım. Özellikle yetkisiz kullanıcıların davet gönderememesi, e-posta bulunamadığında uygun hata mesajı dönmesi ve tekrar davet senaryoları gibi olası durumları kontrol ettim. Mobil tarafta kullanıcıya gösterilecek mesajların kısa ve aksiyon odaklı olmasına dikkat ettim.

Kullanılan teknikler: form doğrulama, asenkron istek yönetimi, hata yakalama, kullanıcıya uyarı bileşenleriyle geri bildirim. Öğrenme olarak, davet gibi işlemlerin genellikle rol/izin kontrolü gerektirdiğini ve mobil tarafta rol bilgisinin doğru yorumlanmasının önemli olduğunu gördüm.

Karşılaşılan sorunlardan biri, kullanıcı daveti gönderdikten sonra davet edilen kişinin listesinin anında güncellenememesi olasılığıydı. Çözüm olarak davet işlemi sonrası kullanıcıya “davet gönderildi” teyidi verip, davetiyelerin karşı tarafta ilgili listeden takip edileceğini açıklayan bir metin akışı planladım.

Günün sonunda davet gönderme akışı test edildi ve bekleyen davetiye ekranı için gereksinimler netleştirildi.

Şekil 9: Davet gönderme ekranı / form doğrulama (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 10 — Bekleyen Davetiyeler: Kabul/Ret, Liste Yenileme ve UI Durumları

Onuncu gün bekleyen davetiyeler ekranında listeleme ve kabul/ret işlemlerinin uçtan uca testini yaptım. Kullanıcı davetiyeleri gördüğünde hangi gruba davet edildiği, davet eden kişinin kim olduğu ve davet mesajı gibi alanların net biçimde görünmesi hedeflendi. Kabul veya ret işleminden sonra listenin güncellenmesi ve kullanıcıya işlem sonucunun açıkça bildirilmesi sağlandı.

Teknik olarak kabul/ret işlemleri birer mutasyon olduğu için işlem sırasında butonların devre dışı bırakılması, yükleniyor göstergesi ve işlem sonrası yeniden veri çekme yaklaşımı uygulandı. Postman üzerinden aynı endpoint’ler çalıştırılarak mobil tarafta oluşan sonuçlarla tutarlılık kontrol edildi. Ayrıca aynı davetiyeye tekrar işlem yapılması gibi hatalı senaryoların nasıl yönetileceği değerlendirildi.

Kullanılan teknikler: liste yönetimi, asenkron istek yönetimi, state senkronizasyonu, hata mesajlarının kullanıcıya uygun şekilde gösterilmesi. Öğrenme olarak, kullanıcı deneyiminde “işlem yaptım mı yapmadım mı” belirsizliğini ortadan kaldırmanın çok önemli olduğunu ve bunun için loading/disable/feedback üçlüsünün birlikte kullanılması gerektiğini öğrendim.

Karşılaşılan bir sorun, hızlı ardışık tıklamalarda çift istek gönderilmesi riskiydi. Çözüm olarak işlem başlayınca ilgili butonların pasif hale getirilmesi ve işlem bitene kadar tekrar tıklamanın engellenmesi planlandı.

Günün değerlendirmesinde davetiye akışı stabil hale getirildi ve grup detay ekranına geçiş için hazırlık tamamlandı.

Şekil 10: Bekleyen davetiyeler listesi ve kabul/ret işlemi (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 11 — Grup Detayları ve Üye Listesi: Rol Gösterimi ve Güvenli Render

On birinci gün, grup detay ekranında grup bilgileri ve üye listesi gösterimini test ettim. Bir grup içindeki üye sayısı, üyelerin adları ve rollerinin (admin/member) mobilde doğru şekilde gösterilmesi kullanıcıların yönetim işlemlerini anlayabilmesi için önemlidir. Bu nedenle API’den gelen detay verisinin mobilde alan alan doğruluğunu kontrol ettim.

Üye listesinde bazı alanların opsiyonel gelebileceği (örneğin kullanıcı adı, rol bilgisi ya da aktivite durumu) durumlara karşı güvenli render yaklaşımı uygulandı. Postman ile aynı grup detay isteği çalıştırılıp mobildeki görünümle karşılaştırıldı. Ayrıca uzun isimler ve çok üyeli gruplarda liste performansının bozulmaması için liste bileşenlerinin kullanım biçimi gözden geçirildi.

Kullanılan teknikler: detay sayfası veri çekme, opsiyonel alan kontrolleri, UI’da fallback metinleri, hata/boş durum yönetimi. Öğrenme olarak, backend’den gelen verinin her zaman “ideal” olmayabileceğini ve mobilde kullanıcıyı yarı yolda bırakmamak için korumalı render yazmak gerektiğini pekiştirdim.

Karşılaşılan sorun olarak üyelerin görüntülenmesi sırasında bazı alan adlarının beklenenle farklı olabilmesi ihtimali vardı. Çözüm olarak veri eşleştirme tablosu (Çizelge 4) oluşturma planı yaptım; böylece mobil geliştirirken hangi alanın nereden geldiği net bir referans olur.

Günün sonunda grup detay ekranı kullanılır hale geldi ve bir sonraki gün harcama/işlem ekleme ekranına geçildi.

Şekil 11: Grup detay ekranı ve üyeler/roller (Yükseklik: 6 cm)

Çizelge 4: Mobil–API veri alanı eşleştirme özeti (ilgili sayfada doldurulacaktır)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 12 — Harcama (Expense) Oluşturma: Katılımcılar, Tutar ve Açıklama

On ikinci gün harcama/işlem oluşturma ekranında kullanıcı akışını test ettim. Kullanıcı bir grupta harcama oluşturduğunda tutar, açıklama ve katılımcı seçimlerinin doğru yapılması gerekir; çünkü borç hesaplamaları bu verilere dayanır. Bu nedenle form alanlarının doğrulanması, özellikle tutar alanında yanlış format girişlerinin engellenmesi ve katılımcı seçiminin net bir arayüzle sağlanması hedeflendi.

API entegrasyon tarafında, harcama oluşturma isteğinin grupId, amount, description, participants ve currency gibi alanları doğru taşıdığını doğruladım. Postman ile aynı isteği göndererek backend’in yanıtında dönen splitAmount gibi hesaplanan alanların varlığını kontrol ettim. Mobilde bu hesaplanan bilgilerin kullanıcıya anlaşılır biçimde gösterilebilmesi için UI metinlerini not aldım.

Kullanılan teknikler: form state yönetimi, sayı formatlama, seçili katılımcılar listesinin yönetimi, loading/hata/başarı geri bildirimi, mutasyon sonrası liste yenileme. Öğrenme olarak, finansal uygulamalarda “küçük” görünen format hatalarının (virgül/nokta, para birimi, yuvarlama) büyük yanlış anlaşılmalara yol açabileceğini ve bu nedenle testlerin detaylı yapılması gerektiğini gördüm.

Karşılaşılan sorun olarak bazı cihazlarda sayı klavyesi farklı davranabildiği için tutar girişinde beklenmeyen karakterler oluşabildi. Çözüm olarak giriş filtresi ve kullanıcıya anlık doğrulama mesajı yaklaşımını planladım.

Günün sonucunda harcama ekleme ekranı stabil hale getirildi ve işlemler listesi ekranına bağlanmaya hazır hale geldi.

Şekil 12: Harcama (expense) ekleme ekranı (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 13 — İşlemler Listesi ve Detay: Veri Sunumu ve Okunabilirlik

On üçüncü gün, grup işlemlerinin listelendiği ekran üzerinde çalıştım. İşlemler listesinde her satırda açıklama, tutar, para birimi ve ödeyen kişi gibi bilgilerin okunabilir biçimde gösterilmesi hedeflendi. Ayrıca işlem detayına girildiğinde katılımcılar, bölüşüm mantığı ve ek açıklamalar gibi bilgiler kullanıcıya net şekilde sunulmalıdır.

API’den gelen işlem listesinin farklı veri hacimlerinde (az işlem, çok işlem) performansını ve UI davranışını kontrol ettim. Postman ile aynı uç noktadan dönen veriyi karşılaştırarak mobilde alanların doğru kullanıldığını doğruladım. Tarih/saat alanlarının kullanıcı için anlamlı formata dönüştürülmesi gerektiğini ve bunun uygulama genelinde standartlaşmasının önemli olduğunu not aldım.

Kullanılan teknikler: liste bileşeni performansı, lazy render yaklaşımı, boş durum mesajları, detay ekranına parametre geçişi, tekrar veri çekme (pull-to-refresh) senaryosu. Öğrenme olarak, kullanıcıların işlemleri hızlı tarayabilmesi için bilgi hiyerarşisinin (en önemli alanlar üstte, ikincil alanlar altta) kritik olduğunu öğrendim.

Karşılaşılan sorun olarak bazı işlemlerde alanların adlandırmasının backend ile farklı olabilmesi ihtimali vardı. Çözüm olarak Çizelge 4’te işlem alan eşleştirmelerini netleştirme planı yaptım. Ayrıca ağ hatasında listenin boş görünmesinin kullanıcıyı yanıltmaması için hata durumunu görsel olarak ayırt eden bir yaklaşım benimsedim.

Günün sonunda işlemler listesi ve detay ekranı kullanılabilir hale geldi ve borçlar modülüne geçiş için hazırlık tamamlandı.

Şekil 13: İşlemler listesi ve işlem detay görünümü (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 14 — Borçlar: Aktif/Ödendi Ayrımı, Borç/Alacak Mantığı

On dördüncü gün borçlar ekranında kullanıcıların borç ve alacak durumunu net biçimde görebilmesini sağlamak için test ve iyileştirme yaptım. Borç kayıtlarında en kritik konu, kullanıcının “borçlu” mu yoksa “alacaklı” mı olduğunu doğru yorumlamak ve bunu ekranda açıkça göstermektir. Bu nedenle API’den gelen borç kayıtlarında creditorId/debtorId alanlarının doğru yorumlanmasına odaklandım.

Aktif (active) ve ödenmiş (settled) borçların ayrıştırılması, kullanıcıya filtre veya sekme mantığıyla sunulması ve her borç kartında tutar, para birimi, açıklama ve durum bilgisinin görünmesi hedeflendi. Postman testleriyle borç listesi uçları tekrar çalıştırılıp mobildeki görünüm doğrulandı.

Kullanılan teknikler: liste sınıflandırma (status), kullanıcı bazlı borç/alacak ayrımı, UI kart tasarımı, hata/boş durum yönetimi. Öğrenme olarak, borç ekranında bir yanlış yönlendirme yapılmasının kullanıcı güvenini doğrudan zedeleyeceğini ve bu nedenle test senaryolarının gerçekçi örneklerle yapılmasının önemli olduğunu öğrendim.

Karşılaşılan sorunlardan biri, bazı borç kayıtlarında ilişkili kullanıcı bilgilerinin eksik gelebilmesiydi. Çözüm olarak fallback isimler ve güvenli erişim kontrolleri planlandı; böylece veri eksik gelse bile kullanıcı temel bilgiyi görmeye devam eder.

Günün sonunda borçlar ekranı kararlı hale getirildi ve ertesi gün borç kapatma (settle) akışı test edilecek şekilde planlandı.

Şekil 14: Borçlar ekranı (aktif/ödendi ayrımı) (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 15 — Borç Kapatma (Settle): Mutasyon Sonrası Senkronizasyon

On beşinci gün borç kapatma (settle) işlemini mobilde uçtan uca test ettim. Kullanıcının bir borcu ödediğini işaretlemesi, API’ye doğru isteğin gitmesi, başarılı yanıt sonrası borcun durumunun güncellenmesi ve mobil listede bunun anında görünmesi hedeflendi. Bu işlem, kullanıcı açısından “tamamlandı” hissi yaratması gereken bir akış olduğu için geri bildirim mesajlarına ve UI güncellemelerine özellikle dikkat edildi.

Teknik olarak settle isteği sırasında buton devre dışı bırakıldı, loading gösterildi ve işlem tamamlandığında kullanıcıya başarı uyarısı verildi. Ardından borç listesinin yeniden çekilmesi veya ilgili borç kaydının lokal state’te güncellenmesi yaklaşımları değerlendirildi. Postman ile aynı settle endpoint’i çalıştırılıp mobildeki sonuçla tutarlılık kontrol edildi.

Kullanılan teknikler: patch/put istekleri, mutasyon sonrası refetch, optimistic update değerlendirmesi, hata yönetimi. Öğrenme olarak, mutasyon yapan işlemlerde kullanıcıya “işlem gerçekleşti” kanıtını vermenin sadece mesaj değil, güncellenmiş veri göstermekle mümkün olduğunu gördüm.

Karşılaşılan sorun olarak, nadiren ağ kesilmesi durumunda işlem sonucu belirsiz kalabilir. Çözüm olarak, işlem başarısız olursa kullanıcıya tekrar dene seçeneği vermek ve API’den tekrar borç listesini çekerek gerçek durumu göstermek planlandı.

Günün sonunda settle akışı kararlı hale getirildi ve toplu/analitik ekranlarına geçiş için temel hazırlandı.

Akış Şeması (Şekil 15): Borç kapatma (settle) akışı — onay penceresi, yükleniyor durumu ve başarı sonrası güncellenen liste

```mermaid
---
config:
  layout: elk
---
flowchart TB
  A[DebtsScreen: Borçlar listesi] --> B["Ödendi" / Settle]
  B --> C{Onay?}
  C -- Vazgeç --> A
  C -- Onayla --> D[Loading + buton pasif]
  D --> E[API: /debts/:id/settle]

  E --> F{Başarılı mı?}
  F -- Evet --> G[Başarı mesajı]
  G --> H[Listeyi güncelle (refetch / state)]
  H --> A

  F -- Hayır --> I[Hata mesajı + Retry]
  I --> B
```

Şekil 15: Borç kapatma (settle) işlem sonucu ve güncellenen liste (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 16 — Analitik/Özet: Toplamlar, Para Birimi ve Sunum

On altıncı gün, analitik/özet ekranında gruba ait toplam harcama, aktif borç ve ödenmiş borç gibi metriklerin mobilde gösterilmesini test ettim. Analitik ekranın amacı, kullanıcıların finansal durumu hızlıca anlayabilmesini sağlamaktır. Bu nedenle sayısal değerlerin para birimiyle birlikte doğru formatta gösterilmesi ve eksik veri geldiğinde ekranın bozulmaması hedeflendi.

API’nin analitik uçları Postman ile tekrar çalıştırıldı ve mobil tarafta gelen verilerin doğru alanlara bağlandığı kontrol edildi. Metriklerin farklı gruplarda farklı değerlerle dönebilmesi, hatta bazı gruplarda veri olmayabilmesi nedeniyle “0 değer” gösterimi ve boş durum metinleri belirlendi.

Kullanılan teknikler: veri formatlama (para birimi, binlik ayırıcı), asenkron istek yönetimi, hata/boş durum yönetimi, kullanıcıya kısa açıklayıcı metinler. Öğrenme olarak, analitik sunumda “doğru sayı” kadar “doğru bağlam”ın da önemli olduğunu gördüm; örneğin toplam harcama ile aktif borç farkını kullanıcıya kısa bir açıklama ile anlatmak gerekir.

Karşılaşılan sorunlardan biri, bazı metriklerin currency ile birlikte gelmemesi ihtimaliydi. Çözüm olarak grubun para birimi bilgisini referans alarak UI’da tutarlı gösterim yapılması planlandı.

Günün sonucunda analitik ekran temel seviyede stabil hale getirildi ve aktivite kayıtları ekranına geçiş planlandı.

Şekil 16: Analitik özet ekranı / toplamlar (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 17 — Aktivite Kayıtları: Şeffaflık ve İzlenebilirlik

On yedinci gün aktivite kayıtları ekranını test ederek kullanıcıların sistem içinde yapılan işlemleri takip edebilmesini hedefledim. Aktivite kayıtları; “kim, ne yaptı, hangi grupta yaptı” bilgisini zaman içinde izlenebilir hale getirir. Bu ekranın doğru çalışması, grup içi şeffaflık açısından önemlidir.

API’den gelen aktivite listesi verisini mobilde listeledim ve farklı gruplarda aktivite sayısı değiştiğinde ekran davranışını gözlemledim. Çok fazla aktivite kaydı olduğunda performansın düşmemesi için liste bileşenlerinin doğru kullanımını kontrol ettim. Ayrıca aktivite açıklamalarının uzun olması durumunda UI’da okunabilirlik için kırpma veya satır sınırı gibi yaklaşımlar değerlendirdim.

Kullanılan teknikler: liste performansı, kısa/uzun metin gösterimi, loading/hata/boş durum yönetimi. Öğrenme olarak, log ekranlarının kullanıcıya “gereğinden fazla teknik bilgi” vermeden de fayda sağlayabileceğini ve doğru seviyede bilgi sunmanın önemli olduğunu gördüm.

Karşılaşılan problem olarak bazı aktivitelerin açıklamaları çok uzun olabiliyordu. Çözüm olarak kısa özet gösterip detay için ayrı görünüm veya genişletme yaklaşımı değerlendirilip en sade çözüm seçildi.

Günün sonunda aktivite ekranı kararlı hale getirildi ve ertesi gün hata yönetimini genel ölçekte iyileştirmeye geçildi.

Şekil 17: Aktivite kayıtları ekranı (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 18 — Yetkisiz Erişim (401/403) ve Ortak Hata Yakalama Yaklaşımı

On sekizinci gün, uygulama genelinde hata yönetimini daha tutarlı hale getirmek için özellikle 401 (Unauthorized) ve 403 (Forbidden) durumlarını ele aldım. Token süresi dolduğunda veya geçersiz olduğunda kullanıcıya doğru mesaj gösterilmesi ve gerekirse giriş ekranına yönlendirilmesi hedeflendi. Aynı şekilde kullanıcının rolü yetmediğinde (ör. admin yetkisi gereken işlem) uygun bilgilendirme yapılması amaçlandı.

Bu kapsamda ortak bir hata yakalama yaklaşımı belirledim: API isteği başarısız olursa önce status code’a göre sınıflandırma, ardından kullanıcıya gösterilecek mesajın seçilmesi ve gerektiğinde logout/token temizliği gibi aksiyonların tetiklenmesi. Böylece farklı ekranlar benzer hatalarda aynı davranışı sergileyecek ve kullanıcı deneyimi tutarlı olacaktır.

Kullanılan teknikler: status code bazlı hata sınıflandırma, kullanıcıya uyarı bileşeni ile geri bildirim, token temizleme yaklaşımı, tekrar deneme mantığı. Öğrenme olarak, hata yönetiminin sadece “mesaj göstermek” değil, aynı zamanda kullanıcıyı doğru akışa yönlendirmek olduğunu gördüm.

Karşılaşılan sorun olarak bazı hatalar üst üste gösterilerek kullanıcıyı rahatsız edebilirdi. Çözüm olarak hata mesajlarını tekilleştirmek, aynı hata kısa sürede tekrar gelirse tek bir uyarı göstermek gibi sadeleştirme yaklaşımı planlandı.

Günün sonunda yetkisiz erişim ve hata yönetimi daha kontrollü hale getirildi ve performans/UX iyileştirmelerine geçildi.

Akış Şeması (Şekil 18): Hata yönetim akışı — 401’de oturum düşürme, 403’te yetki uyarısı

```mermaid
---
config:
	layout: elk
---
flowchart TB
	A[API isteği gönderildi] --> B{Hata var mı?}
	B -- Hayır --> C[Normal akış: veriyi göster]

	B -- Evet --> D{HTTP status}

	D -- 401 --> E[Oturum geçersiz]
	E --> F[Token/Session temizle]
	F --> G[Kullanıcıya: "Oturum süreniz doldu" uyarısı]
	G --> H[Login ekranına yönlendir]

	D -- 403 --> I[Yetki yetersiz]
	I --> J[Kullanıcıya: "Bu işlem için yetkiniz yok" uyarısı]
	J --> K[Mevcut ekranda kal]

	D -- Diğer --> L[Genel hata mesajı + (opsiyonel) Retry]
	L --> K
```

Şekil 18: 401/403 hata yönetimi ve kullanıcı uyarısı (Yükseklik: 6 cm)

Ek 4: Örnek hata yakalama ve kullanıcıya gösterim yaklaşımı

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 19 — Kullanılabilirlik: Loading/Retry, Ağ Hatası Senaryosu ve Stabilite

On dokuzuncu gün, uygulama genelinde kullanılabilirliği artırmak için loading göstergeleri, tekrar deneme (retry) davranışı ve ağ hatası senaryolarını test ettim. Kullanıcıların en sık yaşadığı problemlerden biri, internet bağlantısının zayıf olması veya isteklerin geç yanıt vermesidir. Bu nedenle kullanıcı “uygulama dondu” hissine kapılmamalı; yükleniyor göstergesi görmeli ve hata olursa hızlıca tekrar deneyebilmelidir.

Farklı ekranlarda (gruplar, işlemler, borçlar, analitik) ağ gecikmesi senaryosu düşünülerek UI davranışı gözden geçirildi. Hata durumunda ekranda verinin “boş” sanılmaması için hata mesajı ve retry butonunun görünmesi hedeflendi. Ayrıca yükleniyor göstergesinin çok kısa süre görünüp kaybolmasının “titreme” etkisi yaratmaması için minimum gösterim süresi gibi küçük UX detayları değerlendirildi.

Kullanılan teknikler: global/ekran bazlı loading yönetimi, retry tetikleme, kullanıcıya bilgilendirici mesajlar, hata loglama. Öğrenme olarak, performansın sadece hız değil, kullanıcıya doğru geri bildirim verme meselesi olduğunu ve bu konuda tutarlılığın uygulama kalitesini belirlediğini gördüm.

Karşılaşılan sorun olarak bazı ekranlarda aynı anda birden fazla istek tetiklenebilme ihtimali vardı. Çözüm olarak isteklerin sıralanması, tekrar tetiklemeyi engelleme ve gereksiz refetch’leri azaltma yaklaşımı planlandı.

Günün sonunda uygulamanın ağ koşullarına dayanıklılığı arttı ve son gün uçtan uca senaryo testi için hazırlık tamamlandı.

Şekil 19: Loading/Retry ve ağ hatası senaryosu (Yükseklik: 6 cm)

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………

---

## Sayfa No: ……

### STAJ GÜNÜ 20 — Uçtan Uca Senaryo Testi, Bulgular ve Genel Değerlendirme

Yirminci gün, staj boyunca çalışılan modülleri uçtan uca bir senaryo üzerinden test ederek bütünleşik çalışmayı doğruladım. Senaryoda kullanıcı uygulamaya kayıt olup giriş yaptı, token saklama sayesinde uygulamayı kapatıp açtığında oturumun devam ettiğini gördü, grup oluşturdu, üye davet etti, davet kabul edildi, harcama eklendi, işlemler listesi güncellendi, borçlar ekranında borç/alacak durumu oluştu ve borç kapatma işlemi sonrası borç “ödendi” durumuna geçti.

Bu test sırasında hem mobil UI akışı hem de API yanıtlarının tutarlılığı kontrol edildi. Postman ile kritik uçlar tekrar çalıştırıldı ve mobilde görülen sonuçlarla karşılaştırıldı. Böylece sistemin yalnızca tek tek ekranlarının değil, ekranların birbirine veri ve oturum açısından doğru bağlandığının kanıtı elde edildi.

Kullanılan araçlar: Expo ile mobil test, Postman ile endpoint doğrulama, MongoDB üzerinde veri durumunun kontrolü (gerekli durumlarda), hata senaryolarını canlandırma. Öğrenme olarak, bir uygulamanın gerçek kalitesinin “uçtan uca senaryoda” ortaya çıktığını ve küçük tutarsızlıkların bu aşamada görünür hale geldiğini deneyimledim.

Karşılaşılan sorunlar arasında küçük UI yenileme gecikmeleri ve bazı hata mesajlarının daha kullanıcı dostu hale getirilmesi gereği vardı. Çözüm olarak bir “iyileştirme listesi” çıkarıldı ve sonraki geliştirme döngüsüne aktarılacak maddeler belirlendi. Ayrıca test senaryolarının otomatikleştirilmesi (ör. daha düzenli Postman koleksiyonu, basit e2e checklist) gibi geliştirme fikirleri not edildi.

Genel değerlendirmede; React Native/Expo üzerinde mobil geliştirme, API entegrasyonu, Postman ile test, token güvenliği (Secure Store), hata yönetimi ve veri sunumu gibi konularda önemli pratik kazanımlar elde ettim. Bu kazanımların ileride daha gelişmiş state yönetimi, test otomasyonu ve performans optimizasyonu ile derinleştirilebileceğini değerlendiriyorum.

Akış Diyagramı (Şekil 20): Uçtan uca test döngüsü — Kayıt → Grup → Harcama → Borç Ödeme

```mermaid
---
config:
	layout: elk
---
flowchart TB
	A[Register: /auth/register] --> B[Login: /auth/login]
	B --> C[Session: Token sakla (Secure Store)]
	C --> D[Create Group: /groups]
	D --> E[Invite User: /groups/:id/invite]
	E --> F[Accept Invite: /invitations/accept]
	F --> G[Add Transaction/Expense: /transactions]
	G --> H[UI: Transactions list güncellendi]
	H --> I[Debts: /debts (aktif borç/alacak)]
	I --> J[Settle: /debts/:id/settle]
	J --> K[UI: Borç "ödendi" + liste güncelle (refetch)]
	K --> L{Yeni işlem var mı?}
	L -- Evet --> G
	L -- Hayır --> M[Test tamamlandı]
```

Şekil 20: Uçtan uca senaryo testi çıktısı (Yükseklik: 6 cm)

Çizelge 2: Test edilen temel API uçları ve beklenen sonuçlar

Çizelge 3: Karşılaşılan sorunlar ve uygulanan çözümler

Tarih: …../…../2026

İşyeri Yetkilisi (Ad-Soyad / Islak İmza): ……………………………
