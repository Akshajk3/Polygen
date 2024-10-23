
# Polygen: 3D Model Generation from Images

**Polygen** is a web application that allows users to upload images and generate dense 3D models using photogrammetry techniques. The app is designed to make 3D model generation easy and accessible, transforming your 2D photos into 3D models with precision and speed.

## Features

- **Upload Images**: Upload a series of images from different angles of an object or scene.
- **Automated 3D Model Generation**: Generate dense 3D models automatically using advanced photogrammetry (via PyCOLMAP).
- **Download or View**: After the model is generated, you can download it in PLY or OBJ format.
- **Fast and Secure**: Images are securely stored in Firebase, and model generation is performed on the server side for efficiency.

## How It Works

1. **Upload**: Users upload multiple images to the platform.
2. **Processing**: Polygen's server processes the images using PyCOLMAP to create a dense 3D reconstruction.
3. **Results**: Users can download the resulting 3D model.

## Technologies Used

- **Frontend**: React with SCSS for styling.
- **Backend**: Firebase for authentication and cloud storage.
- **3D Model Processing**: PyCOLMAP for generating dense 3D models, and Open3D for mesh generation.
- **Supported File Formats**: PLY, OBJ for downloading and viewing models.

## Getting Started

### Prerequisites

Ensure that you have the following installed:

- Node.js

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Akshajk3/Polygen.git
cd Polygen
```

2. Install the required dependencies:

```bash
npm install
```

3. Set up Firebase:

- Log in to your Firebase account and create a new project.
- Configure Firebase Authentication and Storage.
- Update the Firebase configuration in the project files.

4. Run the development server:

```bash
npm start
```

The app will now be available at `http://localhost:3000`.

## Usage

1. Sign up or log in with your email or Google account.
2. Upload images of the object or scene you'd like to generate a 3D model from.
3. Wait for the processing to finish.
4. Download the model in PLY or OBJ format.
5. Recommended to use a tool like Meshlab to view and edit the point cloud or mesh.

## Contributing

Contributions are welcome! Feel free to open a pull request if you’d like to improve Polygen.

## License

This project is licensed under the Creative Commons license. See the `LICENSE` file for more details.

## Contact

For any questions or suggestions, feel free to reach out via email: [akshaj.kanumuri@gmail.com].
