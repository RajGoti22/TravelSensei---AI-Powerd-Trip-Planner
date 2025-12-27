# TravelSensei Python Flask Backend

A modern travel booking backend built with Python Flask, featuring ML/AI capabilities with Hugging Face transformers, data analysis with Pandas, and external API integrations.

## 🚀 Features

- **Python Flask** REST API
- **JWT Authentication** with Flask-JWT-Extended
- **MongoDB** integration with MongoEngine
- **Booking.com API** integration via RapidAPI
- **AI/ML Features**:
  - OpenAI GPT integration for travel assistance
  - Hugging Face transformers for sentiment analysis
  - Pandas for data analytics
  - Price prediction algorithms
- **File Upload** with Cloudinary integration
- **Mock Data** fallback when APIs unavailable
- **CORS** enabled for frontend compatibility
- **Rate Limiting** for API protection

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)
- MongoDB (optional - falls back to mock data)

## 🛠️ Installation

1. **Navigate to Python backend directory:**
   ```bash
   cd python-backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys and configuration
   ```

## 🔧 Configuration

Edit `.env` file with your configuration:

```env
# API Keys (optional - will use mock data if not provided)
RAPIDAPI_KEY=your-rapidapi-key
OPENAI_API_KEY=your-openai-api-key

# Database (optional - will use mock data if not provided)
MONGODB_URI=mongodb://localhost:27017/travelsensei

# Cloudinary for file uploads (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Mock data (set to true to force mock data usage)
USE_MOCK_HOTELS=true
```

## 🚀 Running the Server

1. **Start the development server:**
   ```bash
   python app.py
   ```

2. **Server will start on http://localhost:5000**

3. **Health check:** Visit http://localhost:5000/health

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Hotels
- `GET /api/hotels` - Get hotels (supports ?city= filter)
- `GET /api/hotels/search` - Search hotels with parameters
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/hotels/destinations` - Get destination suggestions
- `GET /api/hotels/analytics` - Hotel analytics (Pandas demo)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### AI/ML Features
- `POST /api/ai/chat` - AI travel assistant
- `POST /api/ai/sentiment` - Sentiment analysis
- `POST /api/ai/recommendations` - Get travel recommendations
- `POST /api/ai/price-prediction` - Predict hotel prices

### Data Analytics
- `GET /api/reviews/stats` - Review statistics with Pandas
- `GET /api/hotels/analytics` - Hotel data analysis

## 🔄 Migration from Node.js

This Flask backend maintains **100% API compatibility** with the existing Node.js backend:

- **Same endpoints** and URL patterns
- **Same request/response formats**
- **Same authentication flow**
- **No frontend changes** required

### Running Both Servers

You can run both backends simultaneously:

- **Node.js backend:** http://localhost:5000
- **Python backend:** http://localhost:5001 (change PORT in .env)

## 🤖 AI/ML Capabilities

### 1. Travel Assistant Chatbot
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I need a hotel in Mumbai"}'
```

### 2. Sentiment Analysis
```bash
curl -X POST http://localhost:5000/api/ai/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "Amazing hotel with great service!"}'
```

### 3. Price Prediction
```bash
curl -X POST http://localhost:5000/api/ai/price-prediction \
  -H "Content-Type: application/json" \
  -d '{"location": "mumbai", "rating": 4.5, "amenities": ["wifi", "pool"]}'
```

## 📊 Data Analysis Features

- **Pandas integration** for hotel and review analytics
- **Price analysis** and trend detection
- **Review sentiment** aggregation
- **Booking patterns** analysis

## 🛡️ Security Features

- **JWT Authentication** with refresh tokens
- **Password hashing** with bcrypt
- **Rate limiting** to prevent abuse
- **CORS configuration** for frontend security
- **Input validation** and sanitization

## 🔧 Development

### Installing Additional ML Libraries

```bash
# For advanced NLP features
pip install spacy
python -m spacy download en_core_web_sm

# For computer vision
pip install opencv-python

# For advanced ML models
pip install tensorflow
```

### Running Tests

```bash
pytest tests/
```

## 🚀 Production Deployment

1. **Set environment to production:**
   ```env
   FLASK_ENV=production
   ```

2. **Use a production WSGI server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Set up reverse proxy** (nginx/Apache)

## 🔄 Frontend Integration

The Python backend is designed to be a **drop-in replacement** for the Node.js backend. Simply change your frontend API base URL from:

```javascript
// From Node.js backend
const API_BASE = 'http://localhost:5000'

// To Python backend (if running on different port)
const API_BASE = 'http://localhost:5001'
```

No other frontend changes required!

## 📈 Performance

- **Memory efficient** with proper resource management
- **Concurrent request handling** with Flask
- **Database connection pooling**
- **API response caching** (can be added)
- **Image optimization** with Cloudinary

## 🐛 Troubleshooting

### Common Issues

1. **Import errors:** Make sure virtual environment is activated
2. **Port conflicts:** Change PORT in .env file
3. **API failures:** Check API keys in .env
4. **MongoDB errors:** Ensure MongoDB is running or use mock data

### Mock Data Mode

If you encounter API or database issues, set:
```env
USE_MOCK_HOTELS=true
```

This will use built-in mock data for all operations.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details