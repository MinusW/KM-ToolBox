# **KM ToolBox**

A Ruby-based Discord bot, **KM ToolBox**, designed for *Kingdom Maker* players. This bot provides essential utilities like tracking server refreshes, managing nobles, calculating building and upgrade costs, and organizing private groups within Discord.

---

## **Table of Contents**
1. [About the Project](#about-the-project)
2. [Features](#features)
3. [Commands](#commands)
4. [Installation](#installation)
5. [Contributing](#contributing)
6. [Commit Message Conventions](#commit-message-conventions)
7. [License](#license)
8. [Acknowledgments](#acknowledgments)

---

## **About the Project**

**KM ToolBox** is a tool for *Kingdom Maker* players, enabling them to track in-game activities, manage groups, calculate upgrade costs, and more. The bot leverages CSV files to store necessary data, avoiding the need for complex databases.

---

## **Features**
- **Server Refresh Reports**: Keep track of Kingdom Maker server refreshes (like store and refinery updates).
- **Noble Talent Management**: Calculate noble talent and potential.
- **Group Management**: Create, manage, and delete private group channels.
- **Building Cost Calculations**: Calculate building upgrade costs from any level.
- **Noble Upgrade Costs**: Calculate the cost of upgrading nobles through different levels.
- **Report System**: Players can report bugs or suggest new features.

---

## **Commands**

### **/serverrefresh**
- **Description**: Report a Kingdom Maker server refresh (store or refinery). If 5 users report the refresh, the bot announces it to the server.
- **Usage**: `/serverrefresh`

### **/noble {action} [role] [level/startLevel?] [endLevel?]**
- **Description**: Manage noble talents and cost evaluations. Available actions are: `{talent}`, `{cost}`.
  - `{talent}`: Evaluate a noble's talent and potential at a specific level. Defaults to level 1 if no level is provided.
  - `{cost}`: Calculate the cost to upgrade a noble from one level to another. Defaults to levels 1 and 110 if not specified.
- **Usage**:
  - `/noble talent [role] [level?]` – Evaluate the noble's talent at the given level (defaults to level 1).
  - `/noble cost [role] [startLevel?] [endLevel?]` – Calculate the cost to upgrade a noble from one level to another (defaults to 1 and 110).

### **/group {action} [groupName?] [People?]**
- **Description**: Manage group channels. Available actions are: `{create}`, `{delete}`, `{add}`, and `{kick}`.
- **Usage**:
  - `/group create [groupName] [People]` – Create a new group with up to 5 members.
  - `/group delete` – Delete the current group channel.
  - `/group add [Person]` – Add a new member to the group.
  - `/group kick [Person]` – Remove a member from the group.
  - `/group leave` – Leave the group.

### **/clear [number/all]**
- **Description**: Delete a specified number of messages or all messages in a private chat.
- **Usage**: `/clear [number/all]`

### **/buildcost [buildings] [startLevel?] [endLevel?]**
- **Description**: Calculate the cost to upgrade a building from one level to another. Defaults to levels 1 and 40 if not specified. Building field defaults to all if not specified.
- **Usage**: `/buildcost [building] [startLevel?] [endLevel?]`

### **/temple [startLevel?] [endLevel?]**
- **Description**: Calculate the cost to upgrade the temple from one level to another. Defaults to levels 0 and 50 if not specified.
- **Usage**: `/temple [startLevel?] [endLevel?]`

### **/trait [trait name]**
- **Description**: Displays the stats for each level of a given trait and provides an opinion on the trait's usefulness.
- **Usage**: `/trait [trait name]`

### **/TOTD [tip]**
- **Description**: Submit a Tip of the Day (TOTD) for review by the staff. If approved, the tip will be shown to the community.
- **Usage**: `/TOTD [tip]`

### **/report [type] [message]**
- **Description**: Report a bug or suggest a feature.
- **Usage**: `/report [type] [message]` (where `type` can be either `bug` or `feature`)

### **/contribute**
- **Description**: Get information on how to contribute to the bot's development.
- **Usage**: `/contribute`

### **/help**
- **Description**: Display the list of all available commands.
- **Usage**: `/help`

---

## **Installation**

### **Requirements**
- Ruby 2.7+
- `discordrb` gem

### **Setup**
1. Clone the repository:
   ```bash
   git clone https://github.com/MinusW/KM-ToolBox.git
   ```
2. Install the necessary gems:
   ```bash
   bundle install
   ```
3. Create a `.env` file and add your Discord bot token:
   ```bash
   DISCORD_TOKEN=your_discord_token_here
   ```
4. Run main.rb:
   ```bash
   ruby main.rb
   ```
   
---

## **Contributing**

We welcome contributions! Here's how you can help:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to your branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

Make sure your code is either well-documented or has self-explaining code and is thoroughly tested.

---

## **Commit Message Conventions**

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

- **Types**:
  - `feat`: A new feature.
  - `fix`: A bug fix.
  - `docs`: Changes to documentation.
  - `style`: Code formatting changes (no logic changes).
  - `refactor`: Code restructuring without changing behavior.
  - `test`: Adding or fixing tests.
  - `chore`: Any unwanted task.

**Example**:
```
feat(commands): add group management commands
fix(serverrefresh): correct logic for server refresh announcements
docs: updated documentation
```

---

## **License**

This project is licensed under the MIT License. See the [`LICENSE`](https://github.com/MinusW/KM-ToolBox/blob/main/LICENSE) file for more details.

---

## **Acknowledgments**

- **Global Worldwide** for developing the Kingdom Maker that we know, and providing crucial information for KM ToolBox.
- **discordrb** for providing a fantastic Ruby API for Discord.
- The *Kingdom Maker* community for support and feedback.
