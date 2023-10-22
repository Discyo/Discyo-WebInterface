"""
Copyright (C) 2023  Petr Buchal, Vladimír Jeřábek, Martin Ivančo

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
"""
from typing import Any, Dict, Optional
from pydantic import (
    BaseSettings,
    validator,
)
from pydantic.networks import AnyHttpUrl


class Settings(BaseSettings):

    PROJECT_NAME: str = "Discyo WebInterface API"

    # Wapitch API settings
    WAPITCH_BASE_URL: AnyHttpUrl = ""
    WAPITCH_INTERNAL_BASE_URL: AnyHttpUrl = None

    # make sure that WAPITCH_INTERNAL_BASE_URL is always set
    @validator("WAPITCH_INTERNAL_BASE_URL", pre=True, always=True)
    def set_wapitch_internal_url(cls, v: Optional[str], values: Dict[str, Any]) -> str:
        if isinstance(v, str):
            return v

        if "WAPITCH_BASE_URL" in values:
            return values["WAPITCH_BASE_URL"]
        else:
            return cls.WAPITCH_BASE_URL

    # Recommendations API settings
    RAPI_BASE_URL: AnyHttpUrl = ""

    # logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

    @validator("LOG_LEVEL", pre=True, always=True)
    def upper_log_level(cls, v: str):
        level = v.upper()
        supported_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if level not in supported_levels:
            raise ValueError(f"Log level is unknown!: {level} is not one of {supported_levels}!")
        return level

    class Config:
        case_sensitive = True


settings = Settings()
