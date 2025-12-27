from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

_engine = None
SessionLocal = None


def init_engine(database_url: str):
	global _engine
	_engine = create_engine(database_url, pool_pre_ping=True)


def init_session():
	global SessionLocal
	if _engine is None:
		raise RuntimeError("Engine not initialized")
	SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=_engine))


def get_session():
	if SessionLocal is None:
		raise RuntimeError("Session not initialized")
	return SessionLocal()


