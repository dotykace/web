<div align="center">
  <img src="public/placeholder-logo.svg" alt="TouchThePhone Logo" width="120" height="120" />
  <h1>✨ TouchThePhone ✨</h1>
  <p><strong>An interactive chat experience that blurs the line between you and your device</strong></p>

  <p>
    <a href="https://tochosk.github.io/TouchThePhone/" target="_blank">
      <img src="https://img.shields.io/badge/LIVE_DEMO-Visit_Site-6366F1?style=for-the-badge" alt="Live Demo" />
    </a>
  </p>

  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
</div>

## 🚀 About

TouchThePhone is an immersive interactive chat experience that creates a unique dialogue between you and your device. This project explores the relationship we have with our technology through a guided conversation that feels surprisingly personal.

**Live Demo:** [https://tochosk.github.io/TouchThePhone/](https://tochosk.github.io/TouchThePhone/)

## ✨ Features

- **Interactive Chat Flow** - Engage in a conversation with your device through a beautifully designed chat interface
- **Branching Dialogue** - Multiple choice responses create a personalized experience
- **Visual Flow Editor** - Create and modify conversation paths with an intuitive visual editor
- **Timeout Handling** - Dynamic responses when users take too long to reply
- **Responsive Design** - Perfect experience on any device
- **Animations** - Smooth transitions and visual feedback enhance the experience

## 🔍 Preview

<div align="center">
  <img src="https://sjc.microlink.io/T2GBH-3TQRE_SFtrmkbIPTrF9QKOIpcJ20c73alyTd31NuZo5L2QDKQj82Bxk0aLXiB7d92BHXl05-mM-akYXg.jpeg" alt="TouchThePhone Preview" width="80%" />
</div>

## 🛠️ Technology Stack

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Components**: shadcn/ui
- **Animations**: Framer Motion
- **Graph Visualization**: React Flow with ELK.js

## 🏗️ Project Structure

\`\`\`
TouchThePhone/
├── app/                    # Next.js App Router
│   ├── interactions/       # Interaction editor page
│   └── page.tsx            # Main chat interface
├── components/             # Reusable components
│   ├── interactions/       # Interaction editor components
│   │   ├── interaction-editor.tsx
│   │   ├── interaction-flow.tsx
│   │   └── interaction-node.tsx
│   └── ui/                 # UI components
├── data/                   # Data files
│   └── interactions.json   # Conversation flow data
└── public/                 # Static assets
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/tochosk/TouchThePhone.git

# Navigate to the project directory
cd TouchThePhone

# Install dependencies
pnpm install

# Start the development server
pnpm dev
\`\`\`

Visit `http://localhost:3000` to see the application in action.

## 🎮 Using the Interaction Editor

The interaction editor allows you to create and modify conversation flows:

1. Navigate to `/interactions` to access the editor
2. Use the visual graph to see the conversation flow
3. Click on any node to edit its properties
4. Create new interactions with the "Create New Interaction" button
5. Connect interactions by setting the "Next ID" field

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React Flow](https://reactflow.dev/) for the flow visualization
- [ELK.js](https://github.com/kieler/elkjs) for the graph layout algorithms
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) for the smooth animations
\`\`\`

This README provides a comprehensive overview of your TouchThePhone project with a modern, stylish design. It highlights that the site is running at https://tochosk.github.io/TouchThePhone/ and includes a preview image, feature list, technology stack, and instructions for getting started.

The design uses badges, emojis, and clean formatting to create an attractive presentation that will make your project stand out on GitHub. The structure is organized to give visitors a clear understanding of what your project does and how to use it.

