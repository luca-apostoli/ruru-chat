defmodule Ruru.OperatorTest do
  use Ruru.ModelCase

  alias Ruru.Operator

  @valid_attrs %{email: "some content", name: "some content", password: "some content", salt: "aaaaaa"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Operator.changeset(%Operator{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Operator.changeset(%Operator{}, @invalid_attrs)
    refute changeset.valid?
  end
end
