from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.product import Product
from app.models.variant import ProductVariant
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.schemas.variant import VariantCreate, VariantUpdate, VariantOut
from app.core.security import get_current_user

router = APIRouter(prefix="/api", tags=["Product Catalogue"])

@router.get("/products", response_model=List[ProductOut])
def list_products(
    search: Optional[str] = Query(None),
    product_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if product_type and product_type != "all":
        query = query.filter(Product.product_type == product_type.lower())
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
        
    return query.order_by(Product.created_at.desc()).all()

@router.post("/products", response_model=ProductOut)
def create_product(req: ProductCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = Product(
        name=req.name,
        description=req.description,
        product_type=req.product_type,
        sales_price=req.sales_price,
        cost_price=req.cost_price,
        is_active=req.is_active
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    req: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if req.name is not None:
        product.name = req.name
    if req.description is not None:
        product.description = req.description
    if req.product_type is not None:
        product.product_type = req.product_type
    if req.sales_price is not None:
        product.sales_price = req.sales_price
    if req.cost_price is not None:
        product.cost_price = req.cost_price
    if req.is_active is not None:
        product.is_active = req.is_active
        
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated successfully"}

@router.get("/products/{product_id}/variants", response_model=List[VariantOut])
def list_variants(product_id: int, db: Session = Depends(get_db)):
    return db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()

@router.post("/products/{product_id}/variants", response_model=VariantOut)
def add_variant(
    product_id: int,
    req: VariantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    variant = ProductVariant(
        product_id=product_id,
        name=req.name,
        additional_price=req.additional_price,
        is_active=req.is_active
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant

@router.put("/variants/{variant_id}", response_model=VariantOut)
def update_variant(
    variant_id: int,
    req: VariantUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    if req.name is not None:
        variant.name = req.name
    if req.additional_price is not None:
        variant.additional_price = req.additional_price
    if req.is_active is not None:
        variant.is_active = req.is_active
    db.commit()
    db.refresh(variant)
    return variant

@router.delete("/variants/{variant_id}")
def delete_variant(variant_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    db.delete(variant)
    db.commit()
    return {"message": "Variant deleted successfully"}
