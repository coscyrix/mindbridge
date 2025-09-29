#!/bin/bash

# Docker build script for MindBridge Server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
BUILD_TYPE="dev"
PUSH=false
TAG="latest"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            BUILD_TYPE="$2"
            shift 2
            ;;
        --push)
            PUSH=true
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --type TYPE    Build type: dev, prod (default: dev)"
            echo "  --push         Push image to registry after building"
            echo "  --tag TAG      Tag for the image (default: latest)"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate build type
if [[ "$BUILD_TYPE" != "dev" && "$BUILD_TYPE" != "prod" ]]; then
    print_error "Invalid build type. Use 'dev' or 'prod'"
    exit 1
fi

# Set Dockerfile based on build type
if [[ "$BUILD_TYPE" == "prod" ]]; then
    DOCKERFILE="Dockerfile.prod"
    IMAGE_NAME="mindbridge-server-prod"
else
    DOCKERFILE="Dockerfile"
    IMAGE_NAME="mindbridge-server"
fi

print_status "Building $BUILD_TYPE image using $DOCKERFILE"

# Build the image
docker build -f "$DOCKERFILE" -t "$IMAGE_NAME:$TAG" .

if [ $? -eq 0 ]; then
    print_status "Successfully built $IMAGE_NAME:$TAG"
else
    print_error "Failed to build image"
    exit 1
fi

# Push image if requested
if [ "$PUSH" = true ]; then
    print_status "Pushing image to registry..."
    docker push "$IMAGE_NAME:$TAG"
    
    if [ $? -eq 0 ]; then
        print_status "Successfully pushed $IMAGE_NAME:$TAG"
    else
        print_error "Failed to push image"
        exit 1
    fi
fi

print_status "Build completed successfully!"
