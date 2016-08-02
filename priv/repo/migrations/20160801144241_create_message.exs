defmodule Ruru.Repo.Migrations.CreateMessage do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :text, :string
      add :sender, :string
      add :sender_id, :integer
      add :chat, references(:chats, on_delete: :nothing)

      timestamps()
    end
    create index(:messages, [:chat])

  end
end
