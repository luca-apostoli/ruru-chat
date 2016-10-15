defmodule Ruru.ChatController do
  use Ruru.Web, :controller

  alias Ruru.Chat

  def index(conn, _params) do
    chats = Repo.all(Chat)
    render(conn, "index.html", chats: chats)
  end

  def answer(conn, _params) do
    render(conn, "answer.html")
  end

  def new(conn, _params) do
    changeset = Chat.changeset(%Chat{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"chat" => chat_params}) do
    changeset = Chat.changeset(%Chat{}, chat_params)

    case Repo.insert(changeset) do
      {:ok, _chat} ->
        conn
        |> put_flash(:info, "Chat created successfully.")
        |> redirect(to: chat_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    chat = Repo.get!(Chat, id)
    render(conn, "show.html", chat: chat)
  end

  def edit(conn, %{"id" => id}) do
    chat = Repo.get!(Chat, id)
    changeset = Chat.changeset(chat)
    render(conn, "edit.html", chat: chat, changeset: changeset)
  end

  def update(conn, %{"id" => id, "chat" => chat_params}) do
    chat = Repo.get!(Chat, id)
    changeset = Chat.changeset(chat, chat_params)

    case Repo.update(changeset) do
      {:ok, chat} ->
        conn
        |> put_flash(:info, "Chat updated successfully.")
        |> redirect(to: chat_path(conn, :show, chat))
      {:error, changeset} ->
        render(conn, "edit.html", chat: chat, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    chat = Repo.get!(Chat, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(chat)

    conn
    |> put_flash(:info, "Chat deleted successfully.")
    |> redirect(to: chat_path(conn, :index))
  end
end
