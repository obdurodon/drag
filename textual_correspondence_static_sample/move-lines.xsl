<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:svg="http://www.w3.org/2000/svg"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0">
    <xsl:output method="xhtml" indent="yes" doctype-system="about:legacy-compat"/>
    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:svg">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
            <xsl:apply-templates select="//svg:line"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:g">
        <xsl:copy>
            <xsl:apply-templates select="(node()|@*)  except svg:line"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:line">
        <xsl:variable name="translation"
            select="number(substring-before(../substring-after(@transform,'('),')')) - 100"/>
        <xsl:copy>
            <xsl:attribute name="x1" select="$translation"/>
            <xsl:attribute name="x2" select="$translation -70"/>
            <xsl:attribute name="y1" select="@y1 + 57"/>
            <xsl:attribute name="y2" select="@y2 + 57"/>
            <xsl:apply-templates select="@* except (@x1|@x2|@y1|@y2)"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
