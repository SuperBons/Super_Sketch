from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String, BLOB, ForeignKey, Integer
from sqlalchemy.orm import relationship
from flask_login import UserMixin
import hashlib
import random

SALT_CHARACTERS = "abcdefghijklmnopqrstuvwxyz1234567890!@#%^&*"
SALT_LENGTH = 8

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///boards.db'
app.secret_key = 'This key is super secret! Surely this is secure!'
db = SQLAlchemy(app)

class Artist(UserMixin, db.Model):
    __tablename__ = 'Artist'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    
    def __init__(self, name, username, password):
        print("Creating a new artist...")
        self.name = name
        self.username = username

        salt = ''.join(random.choice(SALT_CHARACTERS) for i in range(SALT_LENGTH))

        saltedPassword = password + salt

        sha256 = hashlib.sha256()
        sha256.update(saltedPassword.encode())
        hashedPassword = sha256.digest()

        storedPassword = salt + "$" + str(hashedPassword)

        self.password = storedPassword

    def passwordIsValid(self, password):
        salt = self.password.split("$", 1)[0]
        passwordHash = self.password.split("$", 1)[1]

        saltedPassword = password + salt

        sha256 = hashlib.sha256()
        sha256.update(saltedPassword.encode())
        hashedPassword = sha256.digest()

        if str(hashedPassword) == str(passwordHash):
            return True
        return False



class Board(db.Model):
    __tablename__ = 'Board'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    boardData = Column(BLOB, nullable=False)
    owner_id = Column(Integer, ForeignKey('Artist.id'), nullable=False)
    owner = relationship(Artist, backref=db.backref('Boards', lazy=True))

    def __init__(self, name, boardData, owner):
        self.name = name
        self.boardData = boardData
        self.owner_id = owner.id
        self.owner = owner

class UserBoardAssociation(db.Model):
    __tablename__ = 'UserBoardAssociation'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('Artist.id'), nullable=False)
    board_id = Column(Integer, ForeignKey('Board.id'), nullable=False)
    user = relationship(Artist)
    board = relationship(Board)

    def __init__(self, user, board):
        self.user_id = user.id
        self.board_id = board.id
        self.user = user
        self.board = board
