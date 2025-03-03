# CommitGuardian - Git Commit Risk Analyzer

An intelligent tool that leverages Azure Machine Learning to analyze Git commits and assess potential risks in real-time.

## Features

- 🔍 Real-time commit analysis
- 📊 Risk scoring and visualization
- 🤖 AI-powered recommendations
- 🔄 Integration with CI/CD pipelines
- 📑 Detailed reporting and insights
- 🎯 Historical pattern analysis

## Installation

```bash
# Clone the repository
git clone https://github.com/artrix5/CommitGuardian.git

# Install dependencies
npm install

# Configure Azure ML credentials
cp .env.example .env
```

## Usage

```bash
# Start the analyzer
npm start

## Configuration

Create a `.env` file with your Azure ML credentials:

```env
AZURE_ML_KEY=your_key_here
AZURE_ML_ENDPOINT=your_endpoint_here
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the {} License - see the [LICENSE](LICENSE) file for details.
