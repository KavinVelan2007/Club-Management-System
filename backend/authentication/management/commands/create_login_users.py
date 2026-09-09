from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from authentication.models import Student, Faculty


class Command(BaseCommand):
    help = "Create Django login accounts for ClubHub students and faculty"

    def handle(self, *args, **options):

        # Create student accounts
        for student in Student.objects.all():

            username = f"student_{student.student_id}"

            user, created = User.objects.get_or_create(
                username=username
            )

            if created:
                user.set_password(student.student_id)
                user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created student account: {student.student_id}"
                    )
                )

        # Create faculty accounts
        for faculty in Faculty.objects.all():

            username = f"faculty_{faculty.faculty_id}"

            user, created = User.objects.get_or_create(
                username=username
            )

            if created:
                user.set_password(faculty.faculty_id)
                user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created faculty account: {faculty.faculty_id}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                "ClubHub login accounts created successfully."
            )
        )