const fs = require("fs");
const path = require("path");

// Function to get the repository name from the current directory
const getRepoName = () => {
  return path.basename(path.resolve("."));
};

// Function to get the list of services from the compose files
const getServices = () => {
  const servicesDir = path.resolve(".");
  const services = [];

  fs.readdirSync(servicesDir).forEach((file) => {
    const filePath = path.join(servicesDir, file, "compose.yml");
    if (fs.existsSync(filePath)) {
      services.push(file);
    }
  });

  return services;
};

// Function to generate the README content
const generateReadmeContent = (repoName, services) => {
  let content = `# ${repoName}\n\n`;
  content += `This repository contains the Docker Compose configurations for various services.\n\n`;
  content += `## Services\n\n`;

  services.forEach((service) => {
    content += `- **${service}**: [Docker Compose configuration for ${service}](./${service}/compose.yml).\n`;
  });

  return content;
};

// Main function to update the README.md file
const updateReadme = () => {
  const repoName = getRepoName();
  const services = getServices();
  const readmeContent = generateReadmeContent(repoName, services);

  fs.writeFileSync("README.md", readmeContent, "utf8");
};

// Run the updateReadme function
updateReadme();
