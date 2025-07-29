"""
Game Statistics Unit Tests
Tests for game statistics schemas, services, and API endpoints

This module tests:
- Game statistics schemas validation
- Game statistics service operations
- API endpoint functionality
- Data integrity and calculations
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.schemas.game_stats import (
    ChallengeResult,
    GameStatsCreate,
    GameStatsQuery,
    GameStatsResponse,
    GameStatsUpdate,
    GlobalGameStats,
    NumberStats,
    PlayerInteraction,
    PlayerPair,
    RangeStats,
    UserGameStats,
)
from app.services.game_stats_service import GameStatsService


class TestGameStatsSchemas:
    """Test game statistics schemas validation."""

    @pytest.mark.unit
    def test_challenge_result_valid(self):
        """Test valid challenge result creation."""
        challenge_result = ChallengeResult(
            challenge_id="test_challenge_123",
            from_user="user1",
            to_user="user2",
            description="Test challenge",
            range_min=1,
            range_max=10,
            from_user_number=5,
            to_user_number=7,
            result="no_match",
            winner=None,
            created_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
            response_time_from_user=2.5,
            response_time_to_user=3.1,
        )

        assert challenge_result.challenge_id == "test_challenge_123"
        assert challenge_result.from_user == "user1"
        assert challenge_result.to_user == "user2"
        assert challenge_result.result == "no_match"
        assert challenge_result.winner is None

    @pytest.mark.unit
    def test_challenge_result_match(self):
        """Test challenge result with match."""
        challenge_result = ChallengeResult(
            challenge_id="test_challenge_456",
            from_user="user1",
            to_user="user2",
            description="Test challenge",
            range_min=1,
            range_max=10,
            from_user_number=5,
            to_user_number=5,
            result="match",
            winner="user1",
            created_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
        )

        assert challenge_result.result == "match"
        assert challenge_result.winner == "user1"

    @pytest.mark.unit
    def test_number_stats_valid(self):
        """Test valid number stats creation."""
        number_stats = NumberStats(
            number=42,
            times_selected=15,
            success_rate=0.6,
            last_selected=datetime.utcnow(),
        )

        assert number_stats.number == 42
        assert number_stats.times_selected == 15
        assert number_stats.success_rate == 0.6

    @pytest.mark.unit
    def test_range_stats_valid(self):
        """Test valid range stats creation."""
        range_stats = RangeStats(
            range_min=1,
            range_max=10,
            times_used=25,
            success_rate=0.4,
            average_numbers_in_range=2.5,
        )

        assert range_stats.range_min == 1
        assert range_stats.range_max == 10
        assert range_stats.times_used == 25
        assert range_stats.success_rate == 0.4

    @pytest.mark.unit
    def test_user_game_stats_valid(self):
        """Test valid user game stats creation."""
        user_stats = UserGameStats(
            user_id="user123",
            total_challenges=50,
            challenges_created=30,
            challenges_received=20,
            matches_won=15,
            matches_lost=10,
            win_rate=0.6,
            average_response_time=2.5,
            fastest_response_time=0.8,
            favorite_number=7,
            favorite_range_min=1,
            favorite_range_max=10,
            last_active=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        assert user_stats.user_id == "user123"
        assert user_stats.total_challenges == 50
        assert user_stats.win_rate == 0.6
        assert user_stats.favorite_number == 7

    @pytest.mark.unit
    def test_global_game_stats_valid(self):
        """Test valid global game stats creation."""
        global_stats = GlobalGameStats(
            total_challenges=1000,
            total_matches=250,
            total_participants=150,
            most_used_numbers=[],
            least_used_numbers=[],
            most_used_ranges=[],
            overall_success_rate=0.25,
            average_response_time=3.2,
            challenges_today=15,
            challenges_this_week=85,
            challenges_this_month=320,
            last_updated=datetime.utcnow(),
        )

        assert global_stats.total_challenges == 1000
        assert global_stats.total_matches == 250
        assert global_stats.overall_success_rate == 0.25


class TestGameStatsService:
    """Test game statistics service operations."""

    @pytest.fixture
    def mock_firebase_service(self):
        """Create mock Firebase service."""
        mock_service = AsyncMock()
        mock_service.db = AsyncMock()
        return mock_service

    @pytest.fixture
    def game_stats_service(self, mock_firebase_service):
        """Create game stats service with mock Firebase."""
        return GameStatsService(mock_firebase_service)

    @pytest.fixture
    def sample_challenge_result(self):
        """Create sample challenge result for testing."""
        return ChallengeResult(
            challenge_id="test_challenge_123",
            from_user="user1",
            to_user="user2",
            description="Test challenge",
            range_min=1,
            range_max=10,
            from_user_number=5,
            to_user_number=7,
            result="no_match",
            winner=None,
            created_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
            response_time_from_user=2.5,
            response_time_to_user=3.1,
        )

    @pytest.mark.unit
    async def test_create_challenge_result_success(
        self,
        game_stats_service,
        sample_challenge_result,
        mock_firebase_service,
    ):
        """Test successful challenge result creation."""
        # Mock successful operations
        mock_firebase_service.create_document.return_value = "test_id"
        mock_firebase_service.update_document.return_value = True

        result = await game_stats_service.create_challenge_result(
            sample_challenge_result
        )

        assert result is True
        # Verify challenge result was stored
        mock_firebase_service.create_document.assert_called_with(
            "challenge_results",
            sample_challenge_result.dict(),
            sample_challenge_result.challenge_id,
        )

    @pytest.mark.unit
    async def test_create_challenge_result_failure(
        self,
        game_stats_service,
        sample_challenge_result,
        mock_firebase_service,
    ):
        """Test challenge result creation failure."""
        # Mock failure
        mock_firebase_service.create_document.side_effect = Exception(
            "Database error"
        )

        result = await game_stats_service.create_challenge_result(
            sample_challenge_result
        )

        assert result is False

    @pytest.mark.unit
    async def test_get_user_stats_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful user stats retrieval."""
        mock_stats = {
            "user_id": "user123",
            "total_challenges": 50,
            "win_rate": 0.6,
            "last_active": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        mock_firebase_service.get_document.return_value = mock_stats

        result = await game_stats_service.get_user_stats("user123")

        assert result is not None
        assert result.user_id == "user123"
        assert result.total_challenges == 50
        assert result.win_rate == 0.6

    @pytest.mark.unit
    async def test_get_user_stats_not_found(
        self, game_stats_service, mock_firebase_service
    ):
        """Test user stats retrieval when not found."""
        mock_firebase_service.get_document.return_value = None

        result = await game_stats_service.get_user_stats("user123")

        assert result is None

    @pytest.mark.unit
    async def test_get_global_stats_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful global stats retrieval."""
        mock_stats = {
            "total_challenges": 1000,
            "total_matches": 250,
            "overall_success_rate": 0.25,
            "last_updated": datetime.utcnow(),
        }
        mock_firebase_service.get_document.return_value = mock_stats

        result = await game_stats_service.get_global_stats()

        assert result is not None
        assert result.total_challenges == 1000
        assert result.total_matches == 250
        assert result.overall_success_rate == 0.25

    @pytest.mark.unit
    async def test_get_number_stats_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful number stats retrieval."""
        mock_stats = {
            "number": 42,
            "times_selected": 15,
            "success_rate": 0.6,
            "last_selected": datetime.utcnow(),
        }
        mock_firebase_service.get_document.return_value = mock_stats

        result = await game_stats_service.get_number_stats(42)

        assert result is not None
        assert result.number == 42
        assert result.times_selected == 15
        assert result.success_rate == 0.6

    @pytest.mark.unit
    async def test_get_top_numbers_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful top numbers retrieval."""
        mock_numbers = [
            {
                "number": 7,
                "times_selected": 25,
                "success_rate": 0.5,
                "last_selected": datetime.utcnow(),
            },
            {
                "number": 42,
                "times_selected": 20,
                "success_rate": 0.6,
                "last_selected": datetime.utcnow(),
            },
        ]
        mock_firebase_service.query_documents.return_value = mock_numbers

        result = await game_stats_service.get_top_numbers(
            limit=5, by_usage=True
        )

        assert len(result) == 2
        assert result[0].number == 7
        assert result[0].times_selected == 25
        assert result[1].number == 42
        assert result[1].times_selected == 20

    @pytest.mark.unit
    async def test_get_top_ranges_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful top ranges retrieval."""
        mock_ranges = [
            {
                "range_min": 1,
                "range_max": 10,
                "times_used": 50,
                "success_rate": 0.3,
                "average_numbers_in_range": 2.5,
            },
            {
                "range_min": 1,
                "range_max": 20,
                "times_used": 30,
                "success_rate": 0.4,
                "average_numbers_in_range": 3.2,
            },
        ]
        mock_firebase_service.query_documents.return_value = mock_ranges

        result = await game_stats_service.get_top_ranges(limit=5)

        assert len(result) == 2
        assert result[0].range_min == 1
        assert result[0].range_max == 10
        assert result[0].times_used == 50
        assert result[1].range_min == 1
        assert result[1].range_max == 20
        assert result[1].times_used == 30

    @pytest.mark.unit
    async def test_get_challenge_history_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful challenge history retrieval."""
        mock_challenges = [
            {
                "challenge_id": "challenge1",
                "from_user": "user1",
                "to_user": "user2",
                "description": "Test challenge 1",
                "range_min": 1,
                "range_max": 10,
                "from_user_number": 5,
                "to_user_number": 7,
                "result": "no_match",
                "winner": None,
                "created_at": datetime.utcnow(),
                "completed_at": datetime.utcnow(),
            },
            {
                "challenge_id": "challenge2",
                "from_user": "user1",
                "to_user": "user3",
                "description": "Test challenge 2",
                "range_min": 1,
                "range_max": 20,
                "from_user_number": 10,
                "to_user_number": 10,
                "result": "match",
                "winner": "user1",
                "created_at": datetime.utcnow(),
                "completed_at": datetime.utcnow(),
            },
        ]
        mock_firebase_service.query_documents_multiple.return_value = (
            mock_challenges
        )

        result = await game_stats_service.get_challenge_history(
            "user1", limit=10
        )

        assert len(result) == 2
        assert result[0].challenge_id == "challenge1"
        assert result[0].result == "no_match"
        assert result[1].challenge_id == "challenge2"
        assert result[1].result == "match"
        assert result[1].winner == "user1"


class TestGameStatsValidation:
    """Test game statistics validation rules."""

    @pytest.mark.unit
    def test_challenge_result_invalid_range(self):
        """Test challenge result with invalid range."""
        with pytest.raises(ValueError):
            ChallengeResult(
                challenge_id="test",
                from_user="user1",
                to_user="user2",
                description="Test",
                range_min=10,
                range_max=5,  # Invalid: max < min
                from_user_number=5,
                to_user_number=7,
                result="no_match",
                winner=None,
                created_at=datetime.utcnow(),
                completed_at=datetime.utcnow(),
            )

    @pytest.mark.unit
    def test_challenge_result_invalid_numbers(self):
        """Test challenge result with numbers outside range."""
        with pytest.raises(ValueError):
            ChallengeResult(
                challenge_id="test",
                from_user="user1",
                to_user="user2",
                description="Test",
                range_min=1,
                range_max=10,
                from_user_number=15,  # Invalid: outside range
                to_user_number=7,
                result="no_match",
                winner=None,
                created_at=datetime.utcnow(),
                completed_at=datetime.utcnow(),
            )

    @pytest.mark.unit
    def test_number_stats_invalid_number(self):
        """Test number stats with invalid number."""
        with pytest.raises(ValueError):
            NumberStats(
                number=150,  # Invalid: > 100
                times_selected=10,
                success_rate=0.5,
                last_selected=datetime.utcnow(),
            )

    @pytest.mark.unit
    def test_range_stats_invalid_range(self):
        """Test range stats with invalid range."""
        with pytest.raises(ValueError):
            RangeStats(
                range_min=1,
                range_max=150,  # Invalid: > 100
                times_used=10,
                success_rate=0.5,
                average_numbers_in_range=2.5,
            )

    @pytest.mark.unit
    def test_user_stats_invalid_win_rate(self):
        """Test user stats with invalid win rate."""
        with pytest.raises(ValueError):
            UserGameStats(
                user_id="user123",
                total_challenges=50,
                challenges_created=30,
                challenges_received=20,
                matches_won=15,
                matches_lost=10,
                win_rate=1.5,  # Invalid: > 1.0
                average_response_time=2.5,
                fastest_response_time=0.8,
                favorite_number=7,
                favorite_range_min=1,
                favorite_range_max=10,
                last_active=datetime.utcnow(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )


class TestSocialStatistics:
    """Test social statistics functionality."""

    @pytest.mark.unit
    def test_player_interaction_valid(self):
        """Test valid player interaction creation."""
        player_interaction = PlayerInteraction(
            user_id="user123",
            username="testuser",
            first_name="Test",
            last_name="User",
            total_challenges_received=25,
            total_challenges_sent=15,
            total_interactions=40,
            last_interaction=datetime.utcnow(),
        )

        assert player_interaction.user_id == "user123"
        assert player_interaction.username == "testuser"
        assert player_interaction.total_interactions == 40
        assert player_interaction.total_challenges_received == 25
        assert player_interaction.total_challenges_sent == 15

    @pytest.mark.unit
    def test_player_pair_valid(self):
        """Test valid player pair creation."""
        player_pair = PlayerPair(
            user1_id="user1",
            user1_username="user1name",
            user2_id="user2",
            user2_username="user2name",
            total_challenges_between=10,
            challenges_from_user1=6,
            challenges_from_user2=4,
            matches_between=3,
            success_rate=0.3,
            last_challenge=datetime.utcnow(),
        )

        assert player_pair.user1_id == "user1"
        assert player_pair.user2_id == "user2"
        assert player_pair.total_challenges_between == 10
        assert player_pair.matches_between == 3
        assert player_pair.success_rate == 0.3

    @pytest.mark.unit
    async def test_get_most_challenged_players_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful most challenged players retrieval."""
        mock_players = [
            {
                "user_id": "user1",
                "username": "user1name",
                "first_name": "User",
                "last_name": "One",
                "total_challenges_received": 30,
                "total_challenges_sent": 20,
                "total_interactions": 50,
                "last_interaction": datetime.utcnow(),
            },
            {
                "user_id": "user2",
                "username": "user2name",
                "first_name": "User",
                "last_name": "Two",
                "total_challenges_received": 25,
                "total_challenges_sent": 15,
                "total_interactions": 40,
                "last_interaction": datetime.utcnow(),
            },
        ]
        mock_firebase_service.query_documents.return_value = mock_players

        result = await game_stats_service.get_most_challenged_players(limit=5)

        assert len(result) == 2
        assert result[0].user_id == "user1"
        assert result[0].total_interactions == 50
        assert result[1].user_id == "user2"
        assert result[1].total_interactions == 40

    @pytest.mark.unit
    async def test_get_most_active_player_pairs_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful most active player pairs retrieval."""
        mock_pairs = [
            {
                "user1_id": "user1",
                "user1_username": "user1name",
                "user2_id": "user2",
                "user2_username": "user2name",
                "total_challenges_between": 15,
                "challenges_from_user1": 8,
                "challenges_from_user2": 7,
                "matches_between": 5,
                "success_rate": 0.33,
                "last_challenge": datetime.utcnow(),
            },
            {
                "user1_id": "user3",
                "user1_username": "user3name",
                "user2_id": "user4",
                "user2_username": "user4name",
                "total_challenges_between": 12,
                "challenges_from_user1": 6,
                "challenges_from_user2": 6,
                "matches_between": 4,
                "success_rate": 0.33,
                "last_challenge": datetime.utcnow(),
            },
        ]
        mock_firebase_service.query_documents.return_value = mock_pairs

        result = await game_stats_service.get_most_active_player_pairs(limit=5)

        assert len(result) == 2
        assert result[0].user1_id == "user1"
        assert result[0].user2_id == "user2"
        assert result[0].total_challenges_between == 15
        assert result[1].user1_id == "user3"
        assert result[1].user2_id == "user4"
        assert result[1].total_challenges_between == 12

    @pytest.mark.unit
    async def test_get_user_friends_activity_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful user friends activity retrieval."""
        mock_pairs = [
            {
                "user1_id": "user1",
                "user1_username": "user1name",
                "user2_id": "user2",
                "user2_username": "user2name",
                "total_challenges_between": 10,
                "challenges_from_user1": 6,
                "challenges_from_user2": 4,
                "matches_between": 3,
                "success_rate": 0.3,
                "last_challenge": datetime.utcnow(),
            },
        ]
        mock_firebase_service.query_documents_multiple.return_value = (
            mock_pairs
        )

        result = await game_stats_service.get_user_friends_activity(
            "user1", limit=5
        )

        assert len(result) == 1
        assert result[0].user1_id == "user1"
        assert result[0].user2_id == "user2"
        assert result[0].total_challenges_between == 10

    @pytest.mark.unit
    async def test_get_user_challenge_recipients_success(
        self, game_stats_service, mock_firebase_service
    ):
        """Test successful user challenge recipients retrieval."""
        mock_challenges = [
            {"from_user": "user1", "to_user": "user2"},
            {"from_user": "user1", "to_user": "user2"},
            {"from_user": "user1", "to_user": "user3"},
        ]
        mock_firebase_service.query_documents.return_value = mock_challenges
        mock_firebase_service.get_document.return_value = {
            "user_id": "user2",
            "username": "user2name",
            "total_challenges_received": 2,
            "total_challenges_sent": 0,
            "total_interactions": 2,
        }

        result = await game_stats_service.get_user_challenge_recipients(
            "user1", limit=5
        )

        assert len(result) == 2  # user2 (2 challenges) and user3 (1 challenge)
        assert result[0].user_id == "user2"
        assert result[0].total_challenges_received == 2
