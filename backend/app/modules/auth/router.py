from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from app.modules.auth.service import AuthService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.core.security import create_access_token
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MessageResponse
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_service():
    return AuthService(UsuarioUnitOfWork())

@router.post("/register", response_model=UserPublic, status_code=201)
def register(
    user_in: UserCreate,
    service: AuthService = Depends(get_auth_service)
):
    return service.register(user_in)

@router.post("/token", response_model=MessageResponse)
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service)
):
    user = service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
        
    access_token = create_access_token(data={"sub": user.username})
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=1800,
        expires=1800,
        samesite="lax"
    )
    
    return {"message": "Login exitoso"}

@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logout exitoso"}

@router.get("/me", response_model=UserPublic)
def read_users_me(current_user: Usuario = Depends(get_current_active_user)):
    return current_user
