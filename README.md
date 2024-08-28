# File OrganizeIt!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**File OrganizeIt!** is a powerful Electron-based application that scans, organizes, and sorts files from a source folder to a destination folder. It categorizes files by date and ensures that no duplicates are transferred, making your file management efficient and clutter-free.

## Key Problems Addressed

**File OrganizeIt!** solves several common file management challenges:

1. **Eliminates Redundant Backups**: Combines multiple backups into a single, organized directory, removing the need for duplicate files.
2. **Reduces Disk Clutter**: Automatically detects and prevents duplicate files, freeing up disk space and reducing digital clutter.
3. **Streamlines Media Organization**: Automatically sorts photos, videos, and other media files by date, making it easier to retrieve event-specific content.
4. **Standardizes File Naming**: Organizes files based on their creation date, providing consistency and making files easier to locate.
5. **Saves Time on Manual Sorting**: Automates file organization, eliminating the need for time-consuming manual sorting.
6. **Improves File Searchability**: Creates a logical directory structure, enabling users to quickly find files from specific time periods.
7. **Enhances Storage Efficiency**: Consolidates files from multiple locations, optimizing storage and potentially freeing up space.

## Features

- **Efficient File Scanning**: Quickly scans source directories for files, making file management seamless.
- **File Type Classification**: Displays the number of images, audio files, videos, documents, and custom file extensions found during the scan.
- **Date-Based Organization**: Sorts and organizes files by date, providing a consistent and logical file structure.
- **Duplicate Prevention**: Detects and prevents duplicate files from being transferred, ensuring a clean destination folder.
- **User-Friendly Interface**: Built with Vue.js and Vuetify for a modern, intuitive user experience.
- **Cross-Platform Compatibility**: Fully supported on Windows, macOS, and Linux.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/reubencarlos/file-organizeit.git
   ```
2. Navigate to the project directory:
   ```
   cd file-organizeit
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

To start the application in development mode:

```
npm run dev
```

To build the application for production:

```
npm run
```

## Building for Specific Platforms

### Windows
```
npm run build:win
```

### macOS
```
npm run build:mac
```

### Linux
```
npm run build:linux
```

### All Platforms
```
npm run build:all
```

## How to Contribute
You are welcome to make contributions to File OrganizeIt! Here's how you can contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

Please ensure your code adheres to our coding standards and include tests for new features.

## Requesting Features
If you have an idea for a new feature:

1. Check the [issues page](https://github.com/reubencarlos/file-organizeit/issues) to see if it has already been suggested
2. If not, create a new issue with the label 'enhancement'
3. Clearly describe the feature and why it would be beneficial
4. If possible, provide examples or mockups

## Sponsorship
If you find File OrganizeIt useful and would like to support its development, consider becoming a sponsor. You can sponsor this project through:

- [GitHub Sponsors](https://github.com/sponsors/reubencarlos)

Your support helps ensure the continued development and maintenance of this project. Thank you for your consideration!

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.