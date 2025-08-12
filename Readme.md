# Todo API with Queue System and Lock Mechanism

## English

### Overview
This is a Node.js Todo API that implements a sophisticated queue system with lock mechanisms to handle concurrent requests and ensure data integrity. The system prevents ID conflicts and provides reliable todo management even under high load.

### Features

#### 1. **Lock Mechanism (Kilit Mekanizması)**
- **Purpose**: Prevents multiple simultaneous operations from interfering with each other
- **How it works**: Uses a boolean flag (`isLocked`) to ensure only one todo creation operation can run at a time
- **Benefits**: 
  - Eliminates ID conflicts
  - Maintains data consistency
  - Prevents race conditions

#### 2. **Queue System (Kuyruk Sistemi)**
- **Purpose**: Handles multiple todo creation requests by queuing them for sequential processing
- **How it works**: 
  - Incoming requests are added to `todoQueue` array
  - Background process (`processQueue`) processes queued items one by one
  - Each item gets a unique timestamp-based ID and status tracking
- **Benefits**:
  - Handles high traffic gracefully
  - Provides request tracking
  - Ensures ordered processing

#### 3. **Background Processing**
- **Purpose**: Continuously processes queued todos without blocking the main API
- **How it works**: `processQueue()` runs in an infinite loop, checking for uncommitted todos every second
- **Benefits**:
  - Non-blocking API responses
  - Reliable background processing
  - Automatic retry mechanism for failed operations

### API Endpoints

#### Standard Todo Operations
- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create a new todo (direct creation)

#### Queue Operations
- `POST /api/todos/queue` - Add todo to processing queue
- `GET /api/todos/queue` - View all queued todos
- `GET /api/todos/queue/:id` - View specific queued todo

### Use Cases

#### **High Traffic Scenarios**
- E-commerce platforms during sales
- Event registration systems
- Social media posting systems
- Any system requiring ordered processing

#### **Data Integrity Requirements**
- Financial transaction systems
- Inventory management
- User registration systems
- Critical data operations

#### **Audit and Tracking Needs**
- Compliance requirements
- Debugging and monitoring
- Performance analysis
- User experience tracking

### Technical Implementation

#### Lock Mechanism
```javascript
const lock = () => { isLocked = true; };
const unlock = () => { isLocked = false; };
```

#### Queue Processing
```javascript
const processQueue = async () => {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Process uncommitted todos
  }
};
```

#### Safe Todo Creation
```javascript
const saveTodo = async (title, description) => {
  if (isLocked) throw new Error('Todo is locked');
  lock();
  // ... create todo with unique ID
  unlock();
  return todo;
};
```

---

## Türkçe

### Genel Bakış
Bu, eşzamanlı istekleri yönetmek ve veri bütünlüğünü sağlamak için gelişmiş kuyruk sistemi ve kilit mekanizmaları uygulayan bir Node.js Todo API'sidir. Sistem, ID çakışmalarını önler ve yüksek yük altında bile güvenilir todo yönetimi sağlar.

### Özellikler

#### 1. **Kilit Mekanizması**
- **Amaç**: Birden fazla eşzamanlı işlemin birbirini etkilemesini önler
- **Nasıl çalışır**: Boolean flag (`isLocked`) kullanarak aynı anda sadece bir todo oluşturma işleminin çalışmasını sağlar
- **Faydalar**: 
  - ID çakışmalarını ortadan kaldırır
  - Veri tutarlılığını korur
  - Yarış koşullarını önler

#### 2. **Kuyruk Sistemi**
- **Amaç**: Birden fazla todo oluşturma isteğini sıraya koyarak sıralı işleme tabi tutar
- **Nasıl çalışır**: 
  - Gelen istekler `todoQueue` dizisine eklenir
  - Arka plan işlemi (`processQueue`) kuyruğa alınan öğeleri tek tek işler
  - Her öğe benzersiz zaman damgası tabanlı ID ve durum takibi alır
- **Faydalar**:
  - Yüksek trafiği zarif bir şekilde yönetir
  - İstek takibi sağlar
  - Sıralı işleme garantisi verir

#### 3. **Arka Plan İşleme**
- **Amaç**: Ana API'yi bloke etmeden kuyruğa alınan todos'ları sürekli işler
- **Nasıl çalışır**: `processQueue()` sonsuz döngüde çalışır, her saniye işlenmemiş todos'ları kontrol eder
- **Faydalar**:
  - API yanıtlarını bloke etmez
  - Güvenilir arka plan işleme
  - Başarısız işlemler için otomatik yeniden deneme mekanizması

### API Uç Noktaları

#### Standart Todo İşlemleri
- `GET /api/todos` - Tüm todos'ları getir
- `POST /api/todos` - Yeni todo oluştur (doğrudan oluşturma)

#### Kuyruk İşlemleri
- `POST /api/todos/queue` - Todo'yu işleme kuyruğuna ekle
- `GET /api/todos/queue` - Tüm kuyruğa alınan todos'ları görüntüle
- `GET /api/todos/queue/:id` - Belirli kuyruğa alınan todo'yu görüntüle

### Kullanım Alanları

#### **Yüksek Trafik Senaryoları**
- Satış sırasında e-ticaret platformları
- Etkinlik kayıt sistemleri
- Sosyal medya paylaşım sistemleri
- Sıralı işleme gerektiren herhangi bir sistem

#### **Veri Bütünlüğü Gereksinimleri**
- Finansal işlem sistemleri
- Envanter yönetimi
- Kullanıcı kayıt sistemleri
- Kritik veri işlemleri

#### **Denetim ve Takip İhtiyaçları**
- Uyumluluk gereksinimleri
- Hata ayıklama ve izleme
- Performans analizi
- Kullanıcı deneyimi takibi

### Teknik Uygulama

#### Kilit Mekanizması
```javascript
const lock = () => { isLocked = true; };
const unlock = () => { isLocked = false; };
```

#### Kuyruk İşleme
```javascript
const processQueue = async () => {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // İşlenmemiş todos'ları işle
  }
};
```

#### Güvenli Todo Oluşturma
```javascript
const saveTodo = async (title, description) => {
  if (isLocked) throw new Error('Todo kilitli');
  lock();
  // ... benzersiz ID ile todo oluştur
  unlock();
  return todo;
};
```

---

## Installation & Setup

```bash
npm install
npm start
```

## Environment
- Node.js
- Express.js
- No external database (in-memory storage for demonstration)

## License
MIT
