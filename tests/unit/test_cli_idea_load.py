"""Tests for CLI idea loading (inline text vs file path)."""

from pathlib import Path
from unittest.mock import patch

import pytest
import typer
from typer.testing import CliRunner

from prompter.cli import _load_idea, _looks_like_path, _slugify, app


runner = CliRunner()


class TestLooksLikePath:
    def test_relative_with_slash(self):
        assert _looks_like_path("docs/examples/foo.md") is True

    def test_backslash(self):
        assert _looks_like_path(r"docs\examples\foo.md") is True

    def test_md_suffix_only(self):
        assert _looks_like_path("idea.md") is True

    def test_plain_prose(self):
        assert _looks_like_path("a quizzing platform for medical students") is False

    def test_absolute(self, tmp_path: Path):
        assert _looks_like_path(str(tmp_path / "missing.md")) is True


class TestLoadIdea:
    def test_loads_md_file_content(self, tmp_path: Path):
        path = tmp_path / "idea.md"
        body = "Build a multi-agent interview coach for software engineers."
        path.write_text(body, encoding="utf-8")

        text, source = _load_idea(str(path))
        assert text == body
        assert source == path

    def test_loads_txt_file(self, tmp_path: Path):
        path = tmp_path / "idea.txt"
        path.write_text("A detailed project idea for a quiz platform.", encoding="utf-8")

        text, source = _load_idea(str(path))
        assert "quiz platform" in text
        assert source is not None

    def test_loads_existing_file_without_known_suffix(self, tmp_path: Path):
        path = tmp_path / "idea"
        path.write_text("A project idea without a conventional extension.", encoding="utf-8")

        text, source = _load_idea(str(path))
        assert "conventional extension" in text
        assert source == path

    def test_inline_idea_returns_none_source(self):
        idea = "a quizzing platform for medical students"
        text, source = _load_idea(idea)
        assert text == idea
        assert source is None

    def test_missing_path_shaped_raises(self):
        with pytest.raises(typer.Exit) as exc:
            _load_idea("docs/examples/does-not-exist.md")
        assert exc.value.exit_code == 1

    def test_empty_file_raises(self, tmp_path: Path):
        path = tmp_path / "empty.md"
        path.write_text("   \n", encoding="utf-8")
        with pytest.raises(typer.Exit) as exc:
            _load_idea(str(path))
        assert exc.value.exit_code == 1

    def test_directory_raises(self, tmp_path: Path):
        with pytest.raises(typer.Exit) as exc:
            _load_idea(str(tmp_path))
        assert exc.value.exit_code == 1

    def test_slug_prefers_filename_stem(self, tmp_path: Path):
        path = tmp_path / "mock_interview_coach.md"
        path.write_text(
            "# Long Title That Should Not Become The Slug\n\n"
            "Build a multi-agent interview coach for software engineers.",
            encoding="utf-8",
        )
        text, source = _load_idea(str(path))
        assert source is not None
        assert _slugify(source.stem) == "mock-interview-coach"
        assert "long-title" not in _slugify(source.stem)


class TestCLIFilePathInvocation:
    def test_generate_missing_file_exits_1(self):
        result = runner.invoke(app, ["generate", "docs/examples/does-not-exist.md"])
        assert result.exit_code == 1
        assert "not found" in result.output.lower()

    def test_interactive_missing_file_exits_1(self):
        result = runner.invoke(app, ["interactive", "path/to/missing-idea.md"])
        assert result.exit_code == 1
        assert "not found" in result.output.lower()

    @patch("prompter.utils.checkpoint.save_checkpoint")
    @patch("prompter.agents.analyzer.analyze")
    def test_interactive_loads_file_into_project_idea(
        self, mock_analyze, mock_checkpoint, tmp_path: Path
    ):
        """Interactive must pass file contents as project_idea, not the path string."""
        body = (
            "Build a multi-agent RPG dungeon master that separates narration "
            "from rules resolution and tracks world state carefully."
        )
        idea_file = tmp_path / "rpg_dm.md"
        idea_file.write_text(body, encoding="utf-8")

        from prompter.models.module_map import (
            DomainClassification,
            InteractionType,
            Module,
            ModuleMap,
        )

        module_map = ModuleMap(
            project_name="RPG DM",
            domain_classification=DomainClassification(primary="gaming", secondary=[]),
            interaction_model=InteractionType.conversational,
            interaction_model_rationale="Multiple agents own narration vs rules.",
            modules=[
                Module(
                    name="Narrator",
                    description="Narrates scenes and NPC dialogue.",
                    requires_ai=True,
                    interaction_type=InteractionType.conversational,
                    data_inputs=["player_action"],
                    data_outputs=["narration"],
                    failure_modes=[],
                ),
            ],
            module_count=1,
            ai_module_count=1,
        )
        mock_analyze.return_value = {
            "module_map": module_map,
            "needs_clarification": False,
            "clarification_questions": [],
            "agent_durations": {"analyzer": 0.1},
            "errors": [],
            "last_checkpoint": "analyze",
        }
        mock_checkpoint.return_value = tmp_path / "checkpoint.json"

        result = runner.invoke(
            app,
            ["interactive", str(idea_file)],
            input="n\n",
        )

        assert result.exit_code == 0, result.output
        assert mock_analyze.called
        state_arg = mock_analyze.call_args[0][0]
        assert state_arg["project_idea"] == body
        assert state_arg["project_idea"] != str(idea_file)
