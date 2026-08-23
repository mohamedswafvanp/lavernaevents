from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed

from .serializers import (
    UserLoginSerializer,
    UserRegistrationSerializer,
)


class UserRegistrationView(APIView):
    """Register a new LavernaEvents user."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Create a new user account."""

        serializer = UserRegistrationSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Registration failed.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()

        return Response(
            {
                "success": True,
                "message": "User registered successfully.",
                "data": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "mobile_number": user.mobile_number,
                    "role": user.role,
                    "is_verified": user.is_verified,
                    "is_active": user.is_active,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class UserLoginView(APIView):
    """Authenticate a user using mobile number and password."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Validate credentials and return JWT tokens."""

        serializer = UserLoginSerializer(
            data=request.data
        )

        try:
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed:
            return Response(
                {
                    "success": False,
                    "message": "Invalid mobile number or password.",
                    "errors": {
                        "authentication": [
                            "Invalid credentials."
                        ]
                    },
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {
                    "access": serializer.validated_data["access"],
                    "refresh": serializer.validated_data["refresh"],
                    "user": serializer.validated_data["user"],
                },
            },
            status=status.HTTP_200_OK,
        )
