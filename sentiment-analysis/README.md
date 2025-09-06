# Social Scope : AI-powered Social Sentiment Analysis

Social Scope is a web application that performs **Real-Time** sentiment analysis on user-provided company, determining whether the sentiment expressed is positive, negative, or neutral.
And provide a detail report of analysis in a intuitive manner.

<img width="956" alt="SocialScope 01" src="https://github.com/user-attachments/assets/982bbfaf-7264-4bc5-9b21-651c045b7100" />


## Features

- **Real-time Analysis**: Enter text and receive immediate sentiment feedback.
- **User-Friendly Interface**: Intuitive design for easy interaction.
- **Responsive Design**: Accessible on various devices.
- **AI based Chat Integration**: Powered by Azure OpenAI

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AbhinavTheDev/sentiment-analysis.git
   ```

2. **Navigate to the project directory**:

   ```bash
   cd sentiment-analysis
   ```

3. **Add Env. Variables**:
    ```bash
    AZURE_OPENAI_API_KEY = <Your Azure OpenAI API Key here>
    AZURE_OPENAI_ENDPOINT = <Your Azure OpenAI Endpoint here>
    ```
5. **Install dependencies**:

   ```bash
   npm install
   ```

6. **Start the development server**:

   ```bash
   npm run dev
   ```

7. **Open the application**:

   Visit `http://localhost:3000` in your browser to view the application.

## Usage

1. Enter some detail of company which you would like to analyze
2. Click the "Start Analysis" button.
3. View the sentiment result, keyword analysis and Volume Analytics displayed on the screen.
4. For further queries and questions, you can interact with **Senti-GPT** (AI-Powered Chatbot for Analysis)
## Technologies Used

- **Frontend**:
  - TypeScript
  - Tailwind CSS
  - Vite

- **Backend**:
  - Node.js

- **Machine Learning**:
  - Azure OpenAI

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**.
2. **Create a new branch**:

   ```bash
   git checkout -b feature-name
   ```

3. **Make your changes**.
4. **Commit your changes**:

   ```bash
   git commit -m 'Add feature'
   ```

5. **Push to the branch**:

   ```bash
   git push origin feature-name
   ```

6. **Open a pull request**.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or feedback, please contact [AbhinavTheDev](https://github.com/AbhinavTheDev). 
