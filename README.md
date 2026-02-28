# Delivery Man App 

A simple Android app that allows delivery personnel to log in via OTP, manage their profiles, and monitor their assigned dispatches.

## Features
- OTP Login
- Location Permission Management
- Profile Management
- List Assigned Dispatches

## Requirements
- Android Studio
- Kotlin

## Getting Started
1. Clone the repository: `git clone https://github.com/drxpharmsam/delivery-man`
2. Open the project in Android Studio.
3. Build and run the project.

## API Endpoints
- To send OTP: `POST /api/auth/send-otp`
- To verify OTP: `POST /api/auth/verify`
- To get assigned dispatches: `GET /api/delivery/dispatch?assignedToDeliveryId={phone}`
- To update dispatch status: `PUT /api/delivery/dispatch/{id}`

### Gradle Config
Make sure to include necessary dependencies in `build.gradle`.
