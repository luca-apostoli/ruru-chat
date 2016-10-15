defmodule Ruru.MessageTest do
  use Ruru.ModelCase

  alias Ruru.Message

  @valid_attrs %{sender: "some content", sender_id: 42, text: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Message.changeset(%Message{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Message.changeset(%Message{}, @invalid_attrs)
    refute changeset.valid?
  end
end
