from django.shortcuts import render

# Create your views here.
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import Student, Faculty


class LoginView(APIView):

    def post(self, request):

        identifier = request.data.get("identifier")
        password = request.data.get("password")
        role = request.data.get("role")

        if not identifier or not password or not role:
            return Response(
                {"error": "Identifier, password and role are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ---------------- STUDENT ----------------

        if role == "student":

            try:
                student = Student.objects.get(
                    student_id=identifier
                )
            except Student.DoesNotExist:
                try:
                    student = Student.objects.get(
                        email=identifier
                    )
                except Student.DoesNotExist:
                    return Response(
                        {"error": "Student not found."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            username = f"student_{student.student_id}"

        # ---------------- FACULTY ----------------

        elif role == "faculty":

            try:
                faculty = Faculty.objects.get(
                    faculty_id=identifier
                )
            except Faculty.DoesNotExist:
                try:
                    faculty = Faculty.objects.get(
                        email=identifier
                    )
                except Faculty.DoesNotExist:
                    return Response(
                        {"error": "Faculty not found."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            username = f"faculty_{faculty.faculty_id}"

        else:
            return Response(
                {"error": "Invalid role."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find Django user
        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {"error": "Invalid password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": role,
            "user_id": identifier
        })