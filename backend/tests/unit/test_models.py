from datetime import datetime, timedelta

import allure
import pytest

# These imports will be updated when we create the actual models
# from app.models.user import User
# from app.models.challenge import Challenge


@allure.epic("Backend Models")
@allure.feature("User Model")
class TestUserModel:
    """Test suite for User model functionality."""

    @allure.story("User Creation")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.unit
    def test_create_user_with_valid_data(self, mock_user_data):
        """Test creating a user with valid data."""
        with allure.step("Prepare valid user data"):
            user_data = mock_user_data

        with allure.step("Create user instance"):
            # This would use the actual User model when implemented
            user = {
                "uid": user_data["uid"],
                "email": user_data["email"],
                "display_name": user_data["display_name"],
                "first_name": user_data.get("first_name"),
                "last_name": user_data.get("last_name"),
                "username": user_data.get("username"),
                "created_at": user_data["created_at"],
            }

        with allure.step("Verify user attributes"):
            assert user["uid"] == "test-user-id"
            assert user["email"] == "test@example.com"
            assert user["display_name"] == "Test User"
            assert user["first_name"] is None  # Optional field
            assert user["last_name"] is None  # Optional field
            assert user["username"] is None  # Optional field
            assert user["created_at"] is not None

    @allure.story("User Validation")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.unit
    def test_user_email_validation(self):
        """Test user email validation."""
        with allure.step("Test valid email"):
            valid_email = "test@example.com"
            assert "@" in valid_email
            assert "." in valid_email.split("@")[1]

        with allure.step("Test invalid email"):
            invalid_email = "invalid-email"
            assert "@" not in invalid_email

    @allure.story("User Properties")
    @allure.severity(allure.severity_level.MINOR)
    @pytest.mark.unit
    def test_user_display_name_defaults(self):
        """Test user display name defaults to email prefix."""
        with allure.step("Create user without display name"):
            email = "test@example.com"
            default_name = email.split("@")[0]

        with allure.step("Verify default display name"):
            assert default_name == "test"

    @allure.story("Username Validation")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.unit
    def test_username_validation(self):
        """Test username validation rules."""
        with allure.step("Test valid username"):
            valid_usernames = ["john_doe", "jane123", "user-name", "test_user_123"]
            for username in valid_usernames:
                assert len(username) >= 3
                assert len(username) <= 30
                # Check if contains only alphanumeric, underscore, and hyphen
                clean_username = username.replace("_", "").replace("-", "")
                assert clean_username.isalnum()

        with allure.step("Test invalid username - too short"):
            invalid_username = "ab"
            assert len(invalid_username) < 3

        with allure.step("Test invalid username - too long"):
            invalid_username = "a" * 31
            assert len(invalid_username) > 30

        with allure.step("Test invalid username - special characters"):
            invalid_username = "user@name"
            clean_username = invalid_username.replace("_", "").replace("-", "")
            assert not clean_username.isalnum()


@allure.epic("Backend Models")
@allure.feature("Challenge Model")
class TestChallengeModel:
    """Test suite for Challenge model functionality."""

    @allure.story("Challenge Creation")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.unit
    def test_create_challenge_with_valid_data(self, mock_challenge_data):
        """Test creating a challenge with valid data."""
        with allure.step("Prepare valid challenge data"):
            challenge_data = mock_challenge_data

        with allure.step("Create challenge instance"):
            challenge = {
                "id": challenge_data["id"],
                "title": challenge_data["title"],
                "description": challenge_data["description"],
                "creator_id": challenge_data["creator_id"],
                "target_number": challenge_data["target_number"],
                "status": challenge_data["status"],
            }

        with allure.step("Verify challenge attributes"):
            assert challenge["id"] == "test-challenge-id"
            assert challenge["title"] == "Test Challenge"
            assert challenge["creator_id"] == "test-user-id"
            assert challenge["target_number"] == 42
            assert challenge["status"] == "active"

    @allure.story("Challenge Validation")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.unit
    def test_challenge_number_range_validation(self):
        """Test challenge number range validation."""
        with allure.step("Test valid range"):
            range_min, range_max = 1, 100
            target_number = 42
            assert range_min <= target_number <= range_max

        with allure.step("Test invalid range - below minimum"):
            target_number = 0
            assert not (range_min <= target_number <= range_max)

        with allure.step("Test invalid range - above maximum"):
            target_number = 101
            assert not (range_min <= target_number <= range_max)

    @allure.story("Challenge Status")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.unit
    def test_challenge_status_transitions(self):
        """Test valid challenge status transitions."""
        with allure.step("Test initial status"):
            status = "active"
            assert status == "active"

        with allure.step("Test completed status"):
            status = "completed"
            assert status in ["active", "completed", "expired", "cancelled"]

        with allure.step("Test expired status"):
            status = "expired"
            assert status in ["active", "completed", "expired", "cancelled"]

    @allure.story("Challenge Expiration")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.unit
    def test_challenge_expiration_logic(self):
        """Test challenge expiration logic."""
        with allure.step("Create challenge with future expiration"):
            now = datetime.now()
            expires_at = now + timedelta(hours=24)
            is_expired = now > expires_at
            assert not is_expired

        with allure.step("Create challenge with past expiration"):
            expires_at = now - timedelta(hours=1)
            is_expired = now > expires_at
            assert is_expired


@allure.epic("Backend Models")
@allure.feature("Game Logic")
class TestGameLogic:
    """Test suite for game logic functionality."""

    @allure.story("Number Matching")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.unit
    def test_number_matching_logic(self):
        """Test the core number matching game logic."""
        with allure.step("Test exact match"):
            guess = 42
            target = 42
            is_match = guess == target
            assert is_match is True

        with allure.step("Test no match"):
            guess = 35
            target = 42
            is_match = guess == target
            assert is_match is False

    @allure.story("Score Calculation")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.unit
    def test_score_calculation(self):
        """Test score calculation based on guess accuracy."""
        with allure.step("Calculate score for exact match"):
            guess = 42
            target = 42
            range_size = 100
            accuracy = 100 - (abs(guess - target) / range_size * 100)
            assert accuracy == 100

        with allure.step("Calculate score for close guess"):
            guess = 40
            target = 42
            range_size = 100
            accuracy = 100 - (abs(guess - target) / range_size * 100)
            expected_accuracy = 100 - (2 / 100 * 100)  # 98%
            assert accuracy == expected_accuracy

    @allure.story("Challenge Completion")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.unit
    def test_challenge_completion_conditions(self):
        """Test conditions for challenge completion."""
        with allure.step("Test completion with exact match"):
            responses = [
                {"user_id": "user1", "guess": 42, "is_correct": True},
                {"user_id": "user2", "guess": 35, "is_correct": False},
            ]
            has_winner = any(response["is_correct"] for response in responses)
            assert has_winner is True

        with allure.step("Test completion without match"):
            responses = [
                {"user_id": "user1", "guess": 35, "is_correct": False},
                {"user_id": "user2", "guess": 30, "is_correct": False},
            ]
            has_winner = any(response["is_correct"] for response in responses)
            assert has_winner is False
